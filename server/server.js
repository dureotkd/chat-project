const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");

const socketIo = require("socket.io");

const server = http.createServer(app);

const port = 4000;

app.use(cors());

server.listen(port, () => {
  console.log("Start Server..");
});

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

/**
 * Room
 */
io.on("connection", (socket) => {
  socket.on("방입장", (방번호) => {
    socket.join(방번호);

    // 방번호에 있는 사람중에 나를 제외하고 전송
    socket.to(방번호).emit("방입장");

    // 나를 제외한 모두한테 보내기
    // socket.broadcast.emit("Hello");

    io.emit("전부");
  });

  console.log("소켓 서버 시작");
});

app.get("/", (req, res) => {
  res.send("hello");
});
