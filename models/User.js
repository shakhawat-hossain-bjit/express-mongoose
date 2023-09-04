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
  email: {
    type: String,
    required: [true, "email is not provided"],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
