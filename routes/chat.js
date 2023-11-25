const express = require("express");
const router = express.Router();

const chat = async (socket) => {
  socket.emit("Hello World");
};
