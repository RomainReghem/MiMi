const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const rooms = io.sockets.adapter.rooms
const { addVictory, addPartie } = require("./controllers/score")

io.on("connection", (socket) => {

  socket.on("joinRoom", (roomCode, mail) => {
    const clients = rooms.get(roomCode);
    const numClients = clients ? clients.size : 0;

    // Si le socket est déjà dans la room
    if (socket.rooms.has(roomCode)) {
      socket.leave(roomCode);
    }

    else if (rooms.get(roomCode) && rooms.get(roomCode).players.includes(mail)) {
      // Si la room a déjà été créée c'est qu'il doit y avoir au moins un mail dans la liste des joueurs
        socket.join(roomCode)
        socket.mail = mail
        socket.emit('YoureIn')
        updateGame(roomCode)
    }

    else if (numClients === 0) {
      console.log("Le premier joueur est arrivé")
      socket.join(roomCode);
      socket.mail = mail;
      rooms.get(roomCode).players = []
      rooms.get(roomCode).players.push(mail)
      rooms.get(roomCode).turn = mail
      rooms.get(roomCode).board = ["", "", "", "", "", "", "", "", ""]
      socket.emit("YoureIn")
    }

    // Il y a déjà quelqu'un dans la salle, on ajoute un deuxième joueur...
    else if (numClients === 1) {
      console.log("Le deuxième joueur est arrivé")
      socket.join(roomCode);
      socket.mail = mail;
      rooms.get(roomCode).players.push(mail)
      socket.emit("YoureIn");
      updateGame(roomCode);
    }

    else {
      socket.emit("gameIsFull");
    }
    console.log(`A user joined the room ${roomCode}, there are now ${numClients} clients in the room.`);

  });

  socket.on("play", ({ id, roomCode }) => {
    // First player plays X
    if (socket.mail == rooms.get(roomCode).players[0]) {
      rooms.get(roomCode).board[id] = "X";
      rooms.get(roomCode).turn = rooms.get(roomCode).players[1]
      io.in(roomCode).emit("canPlay", rooms.get(roomCode).turn);

    } else if (socket.mail == rooms.get(roomCode).players[1]) {
      rooms.get(roomCode).board[id] = "O";
      rooms.get(roomCode).turn = rooms.get(roomCode).players[0]
      io.in(roomCode).emit("canPlay", rooms.get(roomCode).turn);

    } else {
      console.log("Erreur, le mail du socket ne correspond à aucun joueur")
    }

    io.in(roomCode).emit("updateGame", rooms.get(roomCode).board);
    checkVictory(roomCode);
  });

  updateGame = (roomCode) => {
    io.in(roomCode).emit("maxPlayersReached", rooms.get(roomCode).board);
    io.in(roomCode).emit("canPlay", rooms.get(roomCode).turn);
  }

  checkVictory = (roomCode) => {
    let board = rooms.get(roomCode).board;

    // Lines victory conditions
    for (let i = 0; i <= 6; i += 3) {
      if (board[i] == "X" && board[i + 1] == "X" && board[i + 2] == "X") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).players[0]);
        try {
          addVictory(rooms.get(roomCode).players[0]);
        } catch (error) {
          console.log(error)
        }
        io.in(roomCode).socketsLeave(roomCode);

      } else if (board[i] == "O" && board[i + 1] == "O" && board[i + 2] == "O") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).players[1]);
        try {
          addVictory(rooms.get(roomCode).players[1]);
        } catch (error) {
          console.log(error)
        }
        io.in(roomCode).socketsLeave(roomCode);

      }
    }
    // Column victory conditions
    for (let i = 0; i <= 3; i += 1) {
      if (board[i] == "X" && board[i + 3] == "X" && board[i + 6] == "X") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).players[0]);
        try {
          addVictory(rooms.get(roomCode).players[0]);
        } catch (error) {
          console.log(error)
        }
        io.in(roomCode).socketsLeave(roomCode);

      } else if (board[i] == "O" && board[i + 3] == "O" && board[i + 6] == "O") {
        io.in(roomCode).emit("victory", rooms.get(roomCode).players[1]);
        try {
          addVictory(rooms.get(roomCode).players[1]);
        } catch (error) {
          console.log(error)
        }
        io.in(roomCode).socketsLeave(roomCode);

      }
    }
    // Diagonals victory conditions
    if ((board[0] == "X" && board[4] == "X" && board[8] == "X") || (board[2] == "X" && board[4] == "X" && board[6] == "X")) {
      io.in(roomCode).emit("victory", rooms.get(roomCode).players[0]);
      try {
        addVictory(rooms.get(roomCode).players[0]);
      } catch (error) {
        console.log(error)
      }
      io.in(roomCode).socketsLeave(roomCode);

    } else if ((board[0] == "O" && board[4] == "O" && board[8] == "O") || (board[2] == "O" && board[4] == "O" && board[6] == "O")) {
      io.in(roomCode).emit("victory", rooms.get(roomCode).players[1]);
      try {
        addVictory(rooms.get(roomCode).players[1]);
      } catch (error) {
        console.log(error)
      }

      io.in(roomCode).socketsLeave(roomCode);
    }

    // If no more spaces to play on the board, then stops the game. They both lose (victory without a winner parameter)
    if (!board.includes("")) {
      io.in(roomCode).emit("victory");
      try {
        console.log("mail : " + io.sockets.sockets.get(rooms.get(roomCode).player1).mail);
        addPartie(io.sockets.sockets.get(rooms.get(roomCode).player2).mail)
      } catch (error) {
        console.log(error)
      }
      io.in(roomCode).socketsLeave(roomCode);
      return;
    }
  }

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});




server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);