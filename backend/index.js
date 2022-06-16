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
    secret:process.env.SECRET,
    // ne force pas la sauvegarde de la session
    resave: false,
    // ne force pas la sauvegarde d'une session nouvelle mais non modifiée  
    saveUninitialized: false
}));

app.use(cookieParser());

app.use(router);

app.listen(3500, () => {
    console.log("Serveur en marche")
}
);