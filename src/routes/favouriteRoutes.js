import express from "express";
import mongoose from "mongoose";
import protectRoute from "../middleware/auth.middleware.js";

import Favourite from "../models/Favourite.js";
import Review from "../models/Review.js"; // dùng để xác thực review tồn tại (tuỳ chọn)

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { reviewId } = req.body;
    const userId = req.user._id;

    if (!reviewId) {
      return res.status(400).json({ message: "Review ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const reviewExists = await Review.exists({ _id: reviewId });
    if (!reviewExists) {
      return res.status(404).json({ message: "Review not found" });
    }

    const reviewObjectId = new mongoose.Types.ObjectId(reviewId);
    let favourite = await Favourite.findOne({ user: userId });

    if (favourite) {
      if (!favourite.reviews.some(id => id.equals(reviewObjectId))) {
        favourite.reviews.push(reviewObjectId);
        await favourite.save();
      }
    } else {
      favourite = await Favourite.create({
        user: userId,
        reviews: [reviewObjectId],
      });
    }

    res.status(200).json(favourite);
  } catch (error) {
    console.error("Add favourite error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    let favourite = await Favourite.findOne({ user: userId }).populate(
      "reviews"
    );

    if (!favourite) {
      favourite = await Favourite.create({ user: userId });
    }

    res.status(200).json(favourite);
  } catch (error) {
    console.error("List favourites error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:reviewId", protectRoute, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    let favourite = await Favourite.findOne({ user: userId });
    if (!favourite) {
      return res.status(404).json({ message: "Favourite list is empty" });
    }

    const initialLength = favourite.reviews.length;
    favourite.reviews = favourite.reviews.filter(
      id => !id.equals(reviewId)
    );

    if (favourite.reviews.length === initialLength) {
      return res.status(400).json({ message: "Review not found in favourites" });
    }

    await favourite.save();
    res.json({ message: "Review removed from favourites", favourite });
  } catch (error) {
    console.error("Remove favourite error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
