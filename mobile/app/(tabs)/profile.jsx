import { useCallback, useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import Loader from "../../components/Loader";
import CardItem from "../../components/CardItem";

export default function Profile() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const { token } = useAuthStore();

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch user books");

      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải hồ sơ. Bạn hãy kéo xuống để thử lại nhé.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveFavouriteReview = async (reviewId) => {
    try {
      setDeleteReviewId(reviewId);

      const response = await fetch(`${API_URL}/api/favourites/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove favourite");

      setReviews(reviews.filter((review) => review._id !== reviewId));
      Alert.alert("Thành công", "Đã gỡ mục yêu thích thành công");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể gỡ mục yêu thích");
    } finally {
      setDeleteReviewId(null);
    }
  };

  const confirmDelete = (reviewId) => {
    Alert.alert(
      "Gỡ mục yêu thích",
      "Bạn có chắc chắn muốn gỡ yêu mục yêu thích này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gỡ",
          style: "destructive",
          onPress: () => handleRemoveFavouriteReview(reviewId),
        },
      ],
    );
  };

  const renderItem = useCallback(
    ({ item }) => (
      <CardItem item={item} deleteId={deleteReviewId} confirmDelete={confirmDelete} />
    ),
    [confirmDelete, deleteReviewId],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* YOUR FAVOURITE */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Mục yêu thích</Text>
        <Text style={styles.booksCount}>{reviews.length} reviews</Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
