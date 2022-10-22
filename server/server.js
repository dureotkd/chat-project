const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const session = require("express-session");
const fileStore = require("session-file-store")(session); // session file store

const socketIo = require("socket.io");

const server = http.createServer(app);
app.use(
  session({
    secret: "thisissessionSecret",
    saveUninitialize: true,
    store: new fileStore(), // 세션 객체에 세션스토어를 적용
    resave: true,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const port = 4000;

const DB = {
  user: [
    {
      id: 1,
      profile: "https://cacaodada.com/common/img/default_profile.png",
      email: "asd123@naver.com",
      pw: "asd123",
    },
  ],
  room: [
    {
      id: 1,
      name: "[대전] 게임 동아리",
      userIds: [1],
      chat: [],
    },
  ],
};

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
  });

  console.log("소켓 서버 시작");
});

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/login", (req, res) => {
  const { email, pw } = req.query;
  const valid = [1];
  const result = {
    code: "success",
    msg: "로그인 되었습니다",
  };

  for (let x of valid) {
    if (!email) {
      result.code = "fail";
      result.msg = "이메일을 입력해주세요";
      break;
    }
    if (!pw) {
      result.code = "fail";
      result.msg = "비밀번호를 입력해주세요";
      break;
    }
  }

  const findUser = DB.user.find((item) => {
    return item.email === email && item.pw === pw;
  });

  if (!findUser) {
    result.code = "fail";
    result.msg = "일치하는 정보가 없습니다";
  }

  if (result.code === "fail") {
    res.send(result);
    return;
  }

  result.user = {
    email: findUser.email,
    id: findUser.id,
  };

  req.session.loginUser = result.user;
  req.session.save((error) => {
    if (error) console.log(error);
  });

  res.send(result);
});

app.post("/room", (req, res) => {
  const { title } = req.query;
  const { loginUser } = req.session;
  const valid = [1];

  const result = {
    code: "success",
    msg: "방 만들기 성공",
  };

  if (!title) {
    result.code = "fail";
    result.msg = "방 제목을 입력해주세요";
  }

  if (!loginUser.id) {
    result.code = "fail";
    result.msg = "로그인 후 이용해주세요";
  }

  if (result.code === "fail") {
    res.send(result);
    return;
  }

  /**
   * 
   *   room: [
    {
      id: 1,
      name: "[대전] 게임 동아리",
      userIds: [1],
      chat: [{}],
    },
  ],
   */

  const newRoom = {
    id: DB.room.length + 1,
    name: title,
    userIds: [loginUser.id],
    chat: [],
  };

  DB.room.unshift(newRoom);
  result.newRoom = newRoom;

  res.send(result);
  return;
});

app.get("/user/me", (req, res) => {
  const { loginUser } = req.session;

  res.send(loginUser);
});

app.get("/myJoinRoom", (req, res) => {
  const { id, email } = req.session?.loginUser || {};

  const 내가참여한방 = DB.room.filter((item) => {
    return item.userIds.includes(id);
  });

  console.log(내가참여한방);

  res.send(내가참여한방);
});
