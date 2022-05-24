const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const rooms = io.sockets.adapter.rooms

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomCode) => {
    const clients = io.sockets.adapter.rooms.get(roomCode);
    const numClients = clients ? clients.size : 0;

    // Il n'y a personne, on ajoute donc le premier joueur à la salle
    if(numClients == 0) {
      socket.join(roomCode); 
      socket.emit("YoureIn");
      // On donne un pseudo au socket 
      socket.nickname = "player1";
    } 

    // Il y a déjà quelqu'un dans la salle, on ajoute un deuxième joueur...
    else if(numClients == 1){
      socket.join(roomCode); 
      socket.emit("YoureIn");
      // On donne un pseudo au socket 
      socket.nickname = "player2";

      // ... et on commence la partie
      rooms.get(roomCode).board = ["", "", "", "", "", "", "", "", ""]
      io.in(roomCode).emit("maxPlayersReached", rooms.get(roomCode).board);
    } 

    else {
      socket.emit("gameIsFull");
    }
    console.log(`A user joined the room ${roomCode}, there are now ${numClients} clients in the room.`);
    
  });

  socket.on("play", ({ id, roomCode }) => {
    console.log(`play at ${id} to ${roomCode}`);
    socket.broadcast.to(roomCode).emit("updateGame", id);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});




server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);