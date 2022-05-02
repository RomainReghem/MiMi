//import { Connexion } from './routes/connexion';
const router = require('./routes/routes.js')

const express = require('express');
const session = require('express-session');
const cors = require("cors");
const cookieParser = require("cookie-parser")

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


const app = express();

app.use(session({
    // pour signer l'id du cookie
    secret: 'T-4c3d-i*{pWF-Mb9-rK',
    // ne force pas la sauvegarde de la session
    resave: false,
    // ne force pas la sauvegarde d'une session nouvelle mais non smodifiée  
    saveUninitialized: false
}));

app.use(express.json());

app.use(cookieParser());

app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);

app.use(router);


// adresse du serveur, pour faire des tests
app.listen(3500, () => {
    console.log("Serveur en marche")
}
);
