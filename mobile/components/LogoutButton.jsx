import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

export default function LogoutButton() {
  const { logout } = useAuthStore();

  const confirmLogout = () => {
    Alert.alert("Đăng xuất", "Bạn muốn đăng xuất khỏi tài khoản?", [
      { text: "Đăng xuất", onPress: () => logout(), style: "destructive" },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>Đăng xuất</Text>
    </TouchableOpacity>
  );
}
