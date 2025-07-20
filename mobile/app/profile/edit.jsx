import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";

export default function ProfileEdit() {
  const router = useRouter();
  const { user, updateUser, token } = useAuthStore();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await updateUser(data);

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công");
      router.back(); // quay lại
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không cập nhật được hồ sơ");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên người dùng</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
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
});
