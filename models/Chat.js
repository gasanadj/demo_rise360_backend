const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const chatSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "users",
  },
  userName: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Chats = mongoose.model("Chats", chatSchema);
