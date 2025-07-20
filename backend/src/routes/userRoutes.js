import express from "express";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Check for duplicate email or username
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Optional: auto-generate avatar
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = new User({
      username,
      email,
      password,
      role,
      profileImage,
      banned: false, // ensure it's explicitly set
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        banned: user.banned,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/profile", protectRoute, async (req, res) => {
  try {
    const { username, email, password, banned } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (banned) user.banned = banned;

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/profile/image", protectRoute, async (req, res) => {
  try {
    const { profileImage } = req.body;
    const userId = req.user._id;

    if (!profileImage) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profileImage);
    const imageUrl = uploadResponse.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true },
    );

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error updating image:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/ban/:id", protectRoute, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.banned = !user.banned;
    await user.save();

    res.status(200).json({
      message: `User has been ${user.banned ? "banned" : "unbanned"}`,
      banned: user.banned,
    });
  } catch (error) {
    console.error("Error toggling banned status:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/unban/:id", protectRoute, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.banned = false;
    await user.save();

    res.status(200).json({ message: "User has been unbanned" });
  } catch (error) {
    console.error("Error unbanning user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Error getting users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/search", protectRoute, async (req, res) => {
  try {
    const { name, email, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password") // ẩn trường password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      currentPage: parseInt(page),
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { username, email, password, banned, role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (typeof banned === "boolean") user.banned = banned;
    if (role) user.role = role;

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      user.password = password;
    }

    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
