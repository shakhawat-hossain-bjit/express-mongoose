const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Number,
      required: false,
      default: 2,
      // 2 means regular user, 1 means admin user
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
