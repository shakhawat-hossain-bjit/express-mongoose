const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  maidenName: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
  },
  userName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email is not provided"],
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
