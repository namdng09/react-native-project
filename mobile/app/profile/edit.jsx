import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export default function ProfileEdit() {
  const router = useRouter();
  const { user, updateUser, token } = useAuthStore();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imageBase64, setImageBase64] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Quyền bị từ chối", "Vui lòng cấp quyền truy cập ảnh");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled) {
        const chosen = result.assets[0];
        setProfileImage(chosen.uri);

        if (chosen.base64) {
          setImageBase64(chosen.base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(chosen.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const uploadProfileImage = async () => {
    if (!imageBase64) return null;

    const fileType = profileImage?.split(".").pop() || "jpeg";
    const dataUrl = `data:image/${fileType};base64,${imageBase64}`;

    const res = await fetch(`${API_URL}/api/users/profile/image`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profileImage: dataUrl }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload ảnh thất bại");

    return data.profileImage;
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Upload ảnh trước nếu có
      let newImageUrl = profileImage;
      if (imageBase64) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) newImageUrl = uploadedUrl;
      }

      // Nếu muốn đổi mật khẩu, yêu cầu nhập mật khẩu hiện tại
      if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
        Alert.alert("Lỗi", "Vui lòng nhập cả mật khẩu hiện tại và mật khẩu mới");
        return;
      }

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          email,
          password: newPassword || undefined, // chỉ gửi nếu có
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await updateUser({ ...data, profileImage: newImageUrl });

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công");
      setCurrentPassword("");
      setNewPassword("");
      router.back();
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không cập nhật được hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ color: COLORS.placeholderText }}>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Tên người dùng</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />

      <Text style={styles.label}>Mật khẩu hiện tại</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
  },
  button: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePicker: {
    alignSelf: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
});
