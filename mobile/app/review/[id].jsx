import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate, renderRatingStars } from "../../lib/utils";
import styles from "../../assets/styles/reviewDetail.styles";
import COLORS from "../../constants/colors";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";

export default function ReviewDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuthStore();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setReview(data.review);

        // Bắt đầu animation sau khi set dữ liệu
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        Alert.alert("Lỗi", err.message || "Không tải được đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!review) return null;

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={review.image}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: review.user.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{review.user.username}</Text>
        </View>

        <Text style={styles.title}>{review.title}</Text>

        <View style={styles.ratingContainer}>
          {renderRatingStars(review.rating)}
        </View>

        <Text style={styles.caption}>{review.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(review.createdAt)}
        </Text>
      </View>
    </Animated.ScrollView>
  );
}
