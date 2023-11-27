const express = require("express");
const router = express.Router();
const socketAuth = require("../helpers/socketAuth");
const formatMessage = require("../helpers/FormatMessage");

const chat = async (socket) => {
  const { token } = socket.handshake.query;
  const sender = await socketAuth(token);
  if (!sender) {
    throw new Error("DB Error: Not connected yet");
  } else {
    socket.on("sent-chat", (message) => {
      console.log(message);
      socket.emit("chat-message", formatMessage(sender.name, message));
      socket.broadcast.emit(
        "chat-message",
        formatMessage(sender.name, message)
      );
    });
  }
};

module.exports = chat;
