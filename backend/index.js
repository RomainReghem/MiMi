const credential = require('./config/credential')
const router = require('./routes/routes.js')
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
    secret: process.env.SECRET,
    // ne force pas la sauvegarde de la session
    resave: false,
    // ne force pas la sauvegarde d'une session nouvelle mais non modifiée  
    saveUninitialized: false
}));

app.use(cookieParser());

app.use(router);

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
io.on("connection", (socket) => {
    socket.on("joinRoom", (roomCode) => {
        socket.join(roomCode)
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

server.listen(3500, () => {
    console.log("Serveur en marche")
}
);