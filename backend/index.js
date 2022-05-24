const credential = require('./config/credential')
const router = require('./routes/routes.js')

const express = require('express');
const fileupload = require("express-fileupload");
const session = require('express-session');
const cors = require("cors");
const cookieParser = require("cookie-parser")
//onst bodyParser = require("body-parser")

//const db = require("./utils/database").db;

/* Plutot que d'avoir les données confidentielles de la bd : les stocker dans un fichier caché et les récupérer :
require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const db = mysql.createConnection({
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
})*/

const http = require("http");

const app = express();

app.use(credential)

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3500", "35.187.74.158"],
        //methods: ["GET", "POST"],
        //credentials: true,
    })
);

// pour l'enregistrement des documents
/*app.use(fileupload());
app.use(express.static("files"));*/
//app.use(bodyParser.json());

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

const server = http.createServer(app);
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
});
server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);

//db.sequelize.sync().then(() => {
// adresse du serveur, pour faire des tests
app.listen(3500, () => {
    console.log("Serveur en marche")
}
);
//});