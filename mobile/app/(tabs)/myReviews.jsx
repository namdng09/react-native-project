import { useCallback, useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate, renderRatingStars } from "../../lib/utils";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import Loader from "../../components/Loader";
import CardItem from "../../components/CardItem";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { token } = useAuthStore();
  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/reviews/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Fetch reviews failed");

      setReviews(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Lỗi", "Không tải được dữ liệu. Kéo xuống để thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      setDeleteId(id);
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setReviews((prev) => prev.filter((r) => r._id !== id));
      Alert.alert("Thành công", "Đã xoá review");
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không xoá được");
    } finally {
      setDeleteId(null);
    }
  };

  const confirmDelete = (id) =>
    Alert.alert("Xoá review", "Bạn chắc chắn muốn xoá?", [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: () => handleDelete(id) },
    ]);

  const renderItem = useCallback(
    ({ item }) => (
      <CardItem item={item} deleteId={deleteId} confirmDelete={confirmDelete} />
    ),
    [confirmDelete, deleteId],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) return <Loader />;

  return (
    <View style={styles.container}>
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
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Đánh giá của bạn</Text>
            <Text style={styles.headerSubtitle}>{reviews.length} review</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>Chưa có review</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Viết review đầu tiên</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
