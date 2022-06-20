const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
//const io = require("socket.io")(server, { path: '/api-cameras', cors: { origin: "*" } });

io.on("connection", (socket) => {
    socket.on("joinRoom", (roomCode) => {
        socket.join(roomCode)
    })

    socket.on("raiseHand", () => {
        console.log('fromsocket : handraised')
        socket.broadcast.emit("raiseHand");
    })

    socket.on("lowerHand", () => {
        console.log('fromsocket : handlowerd')
        socket.broadcast.emit("lowerHand");
    })

    socket.on("leftCamera", () => {
        console.log('leftCamera')
        socket.broadcast.emit("switchCamera", 0);
    })
    socket.on("centerCamera", () => {
        console.log('centerCamera')
        socket.broadcast.emit("switchCamera", 1);
    })
    socket.on("rightCamera", () => {
        console.log('rightCamera')
        socket.broadcast.emit("switchCamera", 2);
    })
})

server.listen(5555, () =>
  console.log("cameras running on 5555")
);
