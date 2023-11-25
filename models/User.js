const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 30,
  },

  email: {
    type: String,
    required: true,
    min: 10,
    max: 40,
  },

  password: {
    type: String,
    required: true,
    min: 6,
    max: 25,
  },
  phone: {
    type: String,
    required: true,
    min: 10,
  },
  role: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model("User", userSchema);
