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
import MapView, { Marker } from "react-native-maps";
import { useAuthStore } from "../../store/authStore";

export default function ReviewDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuthStore();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const scrollY = useRef(new Animated.Value(0)).current;

  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [2, 1],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [-50, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setReview(data.review);

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
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
    >
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            transform: [{ scale: imageScale }, { translateY: imageTranslateY }],
          },
        ]}
      >
        <Image
          source={review.image}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </Animated.View>

      <View style={styles.content}>
        {/* USER INFO */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: review.user.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
            {review.user.username}
          </Text>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>{review.title}</Text>

        {/* STARS */}
        <View style={styles.ratingContainer}>
          {renderRatingStars(review.rating)}
        </View>

        {/* CAPTION */}
        <View style={styles.captionWrapper}>
          <Text style={styles.mapLabel}>Mô tả</Text>
          <Text style={styles.captionText}>{review.caption}</Text>
        </View>

        {/* MAP */}
        {review.location && (
          <View style={styles.mapWrapper}>
            <Text style={styles.mapLabel}>Vị trí được đánh dấu</Text>
            <MapView
              style={styles.mapPicker}
              initialRegion={{
                latitude: review.location.latitude,
                longitude: review.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              <Marker coordinate={review.location} />
            </MapView>
          </View>
        )}

        {/* DATE */}
        <Text style={styles.date}>
          Shared on {formatPublishDate(review.createdAt)}
        </Text>
      </View>
    </Animated.ScrollView>
  );
}
