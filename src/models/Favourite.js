import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true },
);

const Favourite = mongoose.model("Favourite", FavouriteSchema);

export default Favourite;
