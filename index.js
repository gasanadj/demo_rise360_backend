const http = require("http");
const socket = require("socket.io");
const app = require("./app");
const chatRoute = require("./routes/chat");

const server = http.createServer(app);
const io = new socket.Server(server, {
  pingTimeout: 600000,
  cors: {
    origin: "*",
  },
});

io.on("connection", chatRoute.chat);

server.listen(3000, () => {
  console.log("Server started");
});
