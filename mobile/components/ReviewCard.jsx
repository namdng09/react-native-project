import React, { memo, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import styles from "../assets/styles/home.styles";
import COLORS from "../constants/colors";
import { formatPublishDate, renderRatingStars } from "../lib/utils";
import { useRouter } from "expo-router";

const ReviewCard = ({ item, isLiked, toggleFavourite }) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(null);

  const animateHeart = () => {
    scaleAnim.setValue(0.3);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      animateHeart();
      if (!isLiked) toggleFavourite(item._id);
    } else {
      lastTap.current = now;
    }
  };

  return (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.row}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: item.user.profileImage }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{item.user.username}</Text>
            {/* Heart button */}
            <TouchableOpacity
              onPress={() => toggleFavourite(item._id)}
              style={styles.heartAbs}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Image with double-tap */}
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={styles.bookImageContainer}>
          <Image
            source={item.image}
            style={styles.bookImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />

          {/* big heart animation */}
          <Animated.View
            style={[
              styles.bigHeart,
              { transform: [{ scale: scaleAnim }], opacity: scaleAnim },
            ]}
          >
            <Ionicons name="heart" size={120} color="rgba(255,255,255,0.9)" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Details */}

      <View style={styles.bookDetails}>
        <TouchableOpacity onPress={() => router.push(`/review/${item._id}`)}>
          <Text style={styles.bookTitle}>{item.title}</Text>
        </TouchableOpacity>

        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );
};

// ✅ Chỉ render lại khi item._id hoặc isLiked đổi
export default memo(ReviewCard, (prev, next) => {
  return prev.item._id === next.item._id && prev.isLiked === next.isLiked;
});
