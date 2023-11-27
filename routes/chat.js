const express = require("express");
const router = express.Router();
const socketAuth = require("../helpers/socketAuth");
const formatMessage = require("../helpers/FormatMessage");
const Chat = require("../models/Chat");

const chat = async (socket) => {
  const { token } = socket.handshake.query;
  const sender = await socketAuth(token);
  if (!sender) {
    throw new Error("DB Error: Not connected yet");
  } else {
    socket.on("sent-chat", (message) => {
      const chat = new Chat({
        user: sender._id,
        message: message,
      });
      chat.save().then(() => {
        console.log(message);
        socket.emit("chat-message", formatMessage(sender.name, message));
        socket.broadcast.emit(
          "chat-message",
          formatMessage(sender.name, message)
        );
      });
    });
  }
};

const getChat = async (req, res) => {
  try {
    const savedChats = await Chat.find();
    res.status(200).json({ Message: savedChats });
  } catch (error) {
    res.status(500).json({ Message: error.message });
  }
};

module.exports = {
  chat,
  getChat,
};
