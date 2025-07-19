import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";

import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { useCallback } from "react";
import ReviewCard from "../../components/ReviewCard";

export default function Home() {
  const { token } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /** LOAD MORE ************************************************************/
  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchReviews(page + 1);
    }
  };

  /** FETCH ***************************************************************/
  const fetchReviews = async (pageNum = 1, refresh = false) => {
    try {
      refresh ? setRefreshing(true) : pageNum === 1 && setLoading(true);

      const res = await fetch(`${API_URL}/reviews?page=${pageNum}&limit=2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch reviews");

      const newList =
        refresh || pageNum === 1
          ? data.reviews
          : Array.from(
              new Set([...reviews, ...data.reviews].map((r) => r._id)),
            ).map((id) =>
              [...reviews, ...data.reviews].find((r) => r._id === id),
            );

      setReviews(newList);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (err) {
      // console.error("Error fetching data:", err);
      Alert.alert("Lỗi", "Không tải được dữ liệu. Kéo xuống để thử lại.");
    } finally {
      refresh ? (setRefreshing(false)) : setLoading(false);
    }
  };

  /* ---------------- FETCH FAVOURITES ---------------- */
  const fetchFavourites = async () => {
    try {
      const res = await fetch(`${API_URL}/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setLikedIds(new Set(data.reviews.map((r) => r._id)));
    } catch (err) {
      console.log("Fetch favourites error:", err.message);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchFavourites();
  }, []);

  /* ---------------- TOGGLE FAVOURITE ---------------- */
  const toggleFavourite = async (reviewId) => {
    const alreadyLiked = likedIds.has(reviewId);

    const url = alreadyLiked
      ? `${API_URL}/favourites/${reviewId}`
      : `${API_URL}/favourites`;

    const options = alreadyLiked
      ? { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      : {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewId }),
        };

    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Favourite error");

      setLikedIds((prev) => {
        const next = new Set(prev);
        alreadyLiked ? next.delete(reviewId) : next.add(reviewId);
        return next;
      });
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể cập nhật yêu thích");
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <ReviewCard
        item={item}
        isLiked={likedIds.has(item._id)}
        toggleFavourite={toggleFavourite}
      />
    ),
    [likedIds],
  );

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    setHasMore(true);
    setPage(1);

    try {
      await Promise.all([
        fetchReviews(1, true),
        fetchFavourites(),
      ]);
    } catch (err) {
      console.log("Refresh error:", err.message);
    }
  };

  if (loading) return <Loader />;

  /** MAIN RETURN **********************************************************/
  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ReviewSpot ✍️</Text>
            <Text style={styles.headerSubtitle}>
              Khám phá những đánh giá mới nhất👇
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && reviews?.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>Chưa có review nào</Text>
            <Text style={styles.emptySubtext}>
              Hãy là người đầu tiên chia sẻ!
            </Text>
          </View>
        }
      />
    </View>
  );
}
