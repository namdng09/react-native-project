import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

export function formatMemberSince(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

// this function will convert the createdAt to this format: "May 15, 2023"
export function formatPublishDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function renderRatingStars(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    <Ionicons
      key={i + 1}
      name={i + 1 <= rating ? "star" : "star-outline"}
      size={16}
      color={i + 1 <= rating ? "#f4b400" : COLORS.textSecondary}
      style={{ marginRight: 2 }}
    />
  ));
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
