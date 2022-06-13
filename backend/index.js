const credential = require('./config/credential')
const router = require('./routes/routes.js')
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require("cors");
const cookieParser = require("cookie-parser")

const app = express();

app.use(credential)

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3500", "35.187.74.158", "51.210.140.225"],
        //methods: ["GET", "POST"],
        //credentials: true,
    })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(session({
    // pour signer l'id du cookie
    secret:process.env.SECRET,
    // ne force pas la sauvegarde de la session
    resave: false,
    // ne force pas la sauvegarde d'une session nouvelle mais non smodifiée  
    saveUninitialized: false
}));

app.use(cookieParser());

app.use(router);

/*const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });


io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("joinRoom", (roomCode) => {
    console.log(`A user joined the room ${roomCode}`);
    socket.join(roomCode);
  });

  socket.on("play", ({ id, roomCode }) => {
    console.log(`play at ${id} to ${roomCode}`);
    socket.broadcast.to(roomCode).emit("updateGame", id);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});*/
/*server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);*/

app.listen(3500, () => {
    console.log("Serveur en marche")
}
);