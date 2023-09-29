const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title was nottt found"],
      minLength: 5,
      maxLength: 30,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "price was not found"],
    },
    stock: {
      type: Number,
      required: [true, "stock was not found"],
    },
    discountPercentage: {
      type: Number,
    },
    rating: { type: Number, required: [true, "rating was not found"] },
    brand: { type: String },
    category: { type: String },
    images: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
