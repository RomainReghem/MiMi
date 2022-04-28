//import { Connexion } from './routes/connexion';
const router = require('./routes/routes.js')

const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cors = require("cors");

/* On crée une connexion à la database : pour l'instant elle est en local (localhost)
 On rentre le nom d'utilisateur et le mot de passe
 Puis le nom de la base de données
*/

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
    secret: 'secret123',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());

app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
console.log("hey")

app.use(router);


// adresse du serveur, pour faire des tests
app.listen(3500, () => {
    console.log("Serveur en marche")
}
);
