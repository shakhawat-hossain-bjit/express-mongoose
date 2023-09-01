const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  maidenName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email is not provided"],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
