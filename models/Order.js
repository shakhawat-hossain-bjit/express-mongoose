const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
        },
        _id: false,
      },
    ],
    totalPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  // fetch products and check their stock with my quantity
  console.log(" pre this ", this);

  next();
});

// orderSchema.post("save", async function (doc) {
//   console.log("post ", doc._id);
//   orderDetails = await Order.findOne({ _id: doc._id })
//     .populate("products.productId")
//     .populate("customerId");
//   console.log(orderDetails);
// });

const Order = mongoose.model("Orders", orderSchema);
module.exports = Order;
