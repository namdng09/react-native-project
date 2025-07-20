import express from "express";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

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

    user.banned = true;
    await user.save();

    res.status(200).json({ message: "User has been banned" });
  } catch (error) {
    console.error("Error banning user:", error.message);
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

router.get("/search", protectRoute, async (req, res) => {
  try {
    const { username, email, banned } = req.query;
    let filter = {};

    if (username) filter.username = new RegExp(username, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (banned !== undefined) filter.banned = banned === "true";

    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
