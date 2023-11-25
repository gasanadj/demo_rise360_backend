const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const chatSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "users",
  },
  message: {
    type: String,
    required: true,
  },
});

module.exports = Chats = mongoose.model("Chats", chatSchema);
