import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: localStorage.getItem("token") || null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ authUser: null });
      return;
    }

    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/api/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth: ", error);
      set({ authUser: null, token: null });
      localStorage.removeItem("token");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/api/auth/admin/register", data);
      console.log("asdfasdfasdflkjlkjasdf", axiosInstance);
      const { user, token } = res.data;

      set({ authUser: user, token });
      localStorage.setItem("token", token);

      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/api/auth/admin/login", data);
      const { user, token } = res.data;

      set({ authUser: user, token });
      localStorage.setItem("token", token);

      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ authUser: null, token: null });
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const token = get().token;
      const res = await axiosInstance.put("/api/users/profile/image", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ authUser: res.data });
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.log("Error updating profile image:", error);
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
