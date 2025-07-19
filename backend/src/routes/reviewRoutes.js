import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Review from "../models/Review.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image, location } = req.body;

    if (!image || !title || !caption || !rating || !location) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to the database
    const newReview = new Review({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
      location,
    });

    await newReview.save();

    res.status(201).json(newReview);
  } catch (error) {
    console.log("Error creating review", error);
    res.status(500).json({ message: error.message });
  }
});

// Get paginated reviews (infinite scroll)
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalReviews = await Review.countDocuments();

    res.send({
      reviews,
      currentPage: page,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    });
  } catch (error) {
    console.log("Error in get all reviews route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get reviews by logged-in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(reviews);
  } catch (error) {
    console.error("Get user reviews error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a review
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // delete image from cloudinary if exists
    if (review.image && review.image.includes("cloudinary")) {
      try {
        const publicId = review.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await review.deleteOne();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error deleting review", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", protectRoute, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "user",
      "-password",
    );
    if (!review) return res.status(404).json({ message: "Review not found" });

    res.json({ review });
  } catch (error) {
    console.error("Error getting review by ID", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
