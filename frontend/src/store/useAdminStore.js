import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
  users: [],
  reviews: [],
  token: localStorage.getItem("token") || null,
  stats: null,
  loadingUsers: false,
  loadingReviews: false,

  fetchAllReviews: async () => {
    set({ loadingReviews: true });
    try {
      const res = await axiosInstance.get("/api/reviews", {
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });
      set({ reviews: res.data });
    } catch (error) {
      toast.error("Failed to load reviews");
      console.error("Fetch reviews error:", error);
    } finally {
      set({ loadingReviews: false });
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const token = get().token;
      await axiosInstance.delete(`/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Cập nhật lại danh sách reviews sau khi xóa
      set((state) => ({
        reviews: state.reviews.filter((review) => review._id !== reviewId),
      }));

      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete review");
      console.error("Delete review error:", error);
    }
  },

  updateUserById: async (id, data) => {
    const token = get().token;

    try {
      const res = await axiosInstance.put(`/api/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Cập nhật danh sách users sau khi chỉnh sửa thành công
      set((state) => ({
        users: state.users.map((user) =>
          user._id === id ? { ...user, ...res.data } : user,
        ),
      }));

      toast.success("User updated successfully");
      return true;
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error?.response?.data?.message || "Update failed");
      return false;
    }
  },

  fetchUsers: async () => {
    set({ loadingUsers: true });
    try {
      const token = localStorage.getItem("token");
      console.log(token);
      const res = await axiosInstance.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ users: res.data.users });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      set({ loadingUsers: false });
    }
  },

  toggleBanStatus: async (userId) => {
    try {
      const token = get().token;
      const res = await axiosInstance.put(
        `/api/users/ban/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUsers = get().users.map((u) =>
        u._id === userId ? { ...u, banned: res.data.banned } : u,
      );

      set({ users: updatedUsers });
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to toggle ban status");
      console.error("toggleBanStatus error:", error);
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set((state) => ({
        users: state.users.filter((u) => u._id !== userId),
      }));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  },

  createUser: async (userData) => {
    try {
      const token = get().token;
      const res = await axiosInstance.post("/api/users/create", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User created successfully");
      // Add new user to list
      set((state) => ({ users: [...state.users, res.data.user] }));
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error?.response?.data?.message || "Failed to create user");
    }
  },
  // fetchDashboardStats: async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await axiosInstance.get("/api/admin/stats", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     set({ stats: res.data });
  //   } catch (error) {
  //     console.error("Error fetching dashboard stats", error);
  //   }
  // },
}));
