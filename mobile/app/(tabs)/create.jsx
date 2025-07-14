import { useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../../constants/api";

export default function CreateReview() {
  const [productName, setProductName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Từ chối quyền",
            "Ứng dụng cần quyền truy cập thư viện ảnh để tải hình sản phẩm",
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const chosen = result.assets[0];
        setImage(chosen.uri);

        if (chosen.base64) {
          setImageBase64(chosen.base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(chosen.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Lỗi", "Không thể chọn hình ảnh");
    }
  };

  const handleSubmit = async () => {
    if (!productName || !content || !imageBase64 || !rating) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      setLoading(true);

      const fileType = image?.split(".").pop()?.toLowerCase() || "jpeg";
      const imageDataUrl = `data:image/${fileType};base64,${imageBase64}`;

      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: productName,
          caption: content,
          rating,
          image: imageDataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng review thất bại");

      Alert.alert("Thành công", "Đánh giá của bạn đã được đăng!");
      // reset form
      setProductName("");
      setContent("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.error("Create review error:", error);
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị 5 sao
  const renderRatingPicker = () =>
    Array.from({ length: 5 }, (_, i) => (
      <TouchableOpacity
        key={i + 1}
        onPress={() => setRating(i + 1)}
        style={styles.starButton}
      >
        <Ionicons
          name={i + 1 <= rating ? "star" : "star-outline"}
          size={32}
          color={i + 1 <= rating ? "#f4b400" : COLORS.textSecondary}
        />
      </TouchableOpacity>
    ));

  // JSX
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Thêm Đánh Giá Sản Phẩm Hoa</Text>
            <Text style={styles.subtitle}>
              Chia sẻ trải nghiệm mua hoa của bạn
            </Text>
          </View>

          <View style={styles.form}>
            {/* TÊN SẢN PHẨM */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên sản phẩm</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="rose-outline"            /* Đổi icon nếu cần */
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên bó hoa / sản phẩm"
                  placeholderTextColor={COLORS.placeholderText}
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>
            </View>

            {/* ĐÁNH GIÁ */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Đánh giá của bạn</Text>
              <View style={styles.ratingContainer}>{renderRatingPicker()}</View>
            </View>

            {/* HÌNH ẢNH */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hình ảnh sản phẩm</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Nhấn để chọn hình
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* NỘI DUNG REVIEW */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nội dung đánh giá</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Viết cảm nhận về chất lượng hoa, giao hàng..."
                placeholderTextColor={COLORS.placeholderText}
                value={content}
                onChangeText={setContent}
                multiline
              />
            </View>

            {/* NÚT ĐĂNG */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Chia sẻ</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
