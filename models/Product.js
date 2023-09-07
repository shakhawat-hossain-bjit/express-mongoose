const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title was not found"],
    minLength: 5,
    maxLength: 30,
  },
  description: {
    type: String,
  },
  price: {
    type: String,
    required: [true, "price was not found"],
  },
  stock: {
    type: String,
    required: [true, "stock was not found"],
  },
  discountPercentage: {
    type: Number,
  },
  rating: { type: Number, required: [true, "ratinng was not found"] },
  brand: { type: String },
  category: { type: String },
  images: {
    type: [String],
  },
});

const Product = mongoose.model("allproducts", productSchema);
module.exports = Product;
