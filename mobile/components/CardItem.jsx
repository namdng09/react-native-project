import React, { memo, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import styles from "../assets/styles/profile.styles";
import COLORS from "../constants/colors";
import { formatPublishDate, renderRatingStars } from "../lib/utils";
import { useRouter } from "expo-router";

const CardItem = ({ item, deleteId, confirmDelete }) => {
  const router = useRouter();

  return (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <TouchableOpacity onPress={() => router.push(`/review/${item._id}`)}>
          <Text style={styles.bookTitle}>{item.title}</Text>
        </TouchableOpacity>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>{formatPublishDate(item.createdAt)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
      >
        {deleteId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default memo(CardItem);
