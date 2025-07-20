import express from "express";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", protectRoute, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const reviewCount = await Review.countDocuments();

    const bannedUsers = await User.countDocuments({ banned: true });
    const adminUsers = await User.countDocuments({ role: "admin" });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email profileImage createdAt");

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username profileImage")
      .select("caption image createdAt");

    const topReviewers = await Review.aggregate([
      {
        $group: {
          _id: "$user",
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { totalReviews: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          username: "$userInfo.username",
          profileImage: "$userInfo.profileImage",
          totalReviews: 1,
        },
      },
    ]);

    res.json({
      userCount,
      reviewCount,
      bannedUsers,
      adminUsers,
      recentUsers,
      recentReviews,
      topReviewers,
    });
  } catch (error) {
    console.error("Error getting stats:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

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
    const reviews = await Review.find().populate(
      "user",
      "username profileImage",
    );
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in get all reviews route:", error);
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

router.get("/search", protectRoute, async (req, res) => {
  try {
    const { title, rating, page = 1, limit = 5 } = req.query;

    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (rating) {
      filter.rating = Number(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "-password"),
      Review.countDocuments(filter),
    ]);

    res.json({
      reviews,
      currentPage: parseInt(page),
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    });
  } catch (error) {
    console.error("Error searching reviews:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/admin/:id", protectRoute, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
