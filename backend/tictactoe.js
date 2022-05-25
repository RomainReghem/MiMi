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
    if (numClients == 0) {
      socket.join(roomCode);
      socket.emit("YoureIn");
      // On donne un pseudo au socket 
      socket.nickname = "player1";
      rooms.get(roomCode).player1 = socket.id;
    }

    // Il y a déjà quelqu'un dans la salle, on ajoute un deuxième joueur...
    else if (numClients == 1) {
      socket.join(roomCode);
      socket.emit("YoureIn");
      // On donne un pseudo au socket 
      socket.nickname = "player2";
      rooms.get(roomCode).player2 = socket.id;

      // ... et on commence la partie
      rooms.get(roomCode).board = ["", "", "", "", "", "", "", "", ""]
      io.in(roomCode).emit("maxPlayersReached", rooms.get(roomCode).board, rooms.get(roomCode).player1);
    }

    else {
      socket.emit("gameIsFull");
    }
    console.log(`A user joined the room ${roomCode}, there are now ${numClients} clients in the room.`);

  });

  socket.on("play", ({ id, roomCode }) => {
    // First player plays X
    socket.nickname == "player1"
      ? rooms.get(roomCode).board[id] = "X"
      // Second player plays O
      : rooms.get(roomCode).board[id] = "O";

    socket.broadcast.to(roomCode).emit("ennemyPlayed");
    io.in(roomCode).emit("updateGame", rooms.get(roomCode).board);
    checkVictory(roomCode);
  });

  checkVictory = (roomCode) => {
    let board = rooms.get(roomCode).board;

    // Lines victory conditions
    for (let i = 0; i <= 6; i += 3) {
      console.log(i)
      if (board[i] == "X" && board[i + 1] == "X" && board[i + 2] == "X") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).player1);
        io.in(roomCode).socketsLeave(roomCode);

      } else if (board[i] == "O" && board[i + 1] == "O" && board[i + 2] == "O") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).player2);
        io.in(roomCode).socketsLeave(roomCode);

      }
    }

    // Column victory conditions
    for (let i = 0; i <= 3; i += 1) {
      if (board[i] == "X" && board[i + 3] == "X" && board[i + 6] == "X") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).player1);
        io.in(roomCode).socketsLeave(roomCode);

      } else if (board[i] == "O" && board[i + 3] == "O" && board[i + 6] == "O") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).player2);
        io.in(roomCode).socketsLeave(roomCode);

      }
    }

    // Diagonals victory conditions
    if ((board[0] == "X" && board[4] == "X" && board[8] == "X") || (board[2] == "X" && board[4] == "X" && board[6] == "X")) {
      io.in(roomCode).emit("victory", rooms.get(roomCode).player1);
      io.in(roomCode).socketsLeave(roomCode);

    } else if ((board[0] == "O" && board[4] == "O" && board[8] == "O") || (board[2] == "O" && board[4] == "O" && board[6] == "O")) {
      io.in(roomCode).emit("victory", rooms.get(roomCode).player2);
      io.in(roomCode).socketsLeave(roomCode);
    }
  }

  socket.on("disconnect", () => {
    //io.in(roomCode).emit("disconnect");
    console.log("User Disconnected");
  });
});




server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);