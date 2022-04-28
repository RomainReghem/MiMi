//import { Connexion } from './routes/connexion';

const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cors = require("cors");

// pour les routes
/*const connexion = require("./controllers/connexion")
const inscription = require("./controllers/inscription")*/

// Pour le hashage du mot de passe
const bcrypt = require('bcrypt');

/* On crée une connexion à la database : pour l'instant elle est en local (localhost)
 On rentre le nom d'utilisateur et le mot de passe
 Puis le nom de la base de données
*/
const db = mysql.createConnection({
    host: 'localhost',
    user: 'projetmimi',
    password: 'mdpmimi!',
    database: 'db_mimi'
});
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

// CONNEXION
app.post("/connexion", (req, res) => {
   /* données de test qui fonctionnent 
    const pseudo = "eleve8";
    const mdp = "testor";*/
   
    const pseudo = req.body.user;
    const mdp = req.body.pwd;
    console.log("connexion "+mdp+ " "+pseudo )
    if(mdp=="" || pseudo==""){
        res.sendStatus(402)
    }
    db.query('SELECT * FROM eleve WHERE pseudo = ? OR courriel = ?', [pseudo, pseudo], function (error, results, fields) {
        // En cas d'erreur, l'affiche
        if (error) throw error;
        // Si le compte existe
        if (results.length > 0) {
            bcrypt.compare(mdp, results[0].motdepasse, function (err, estValide) {
                if (estValide) {
                    console.log("CONNEXION OK")
                    // si le mot de passe entré correspond bien au mot de passe dans la base de données
                    res.send(results)
                } else {
                    console.log("Mauvais mot de passe")

                    // sinon, si ce n'est pas le bon mdp mais le bon pseudo
                    res.sendStatus(400)
                }
            });
        } else {
            console.log("Utilisateur pas trouvé")

            // si pour le pseudo donné, aucun utilisateur ne correspond 
            res.sendStatus(401);
        }
    });
});

// INSCRIPTION
app.post("/register", (req, res) => {
    /*données de test valides
    const pseudo = "eleve10";
    const prenom = "test";
    const nom = "test";
    const email = "eleve10@test.fr";
    const mdp = "testoror";*/

    const pseudo = req.body.user;
    const prenom =  req.body.firstName;
    const nom =  req.body.name;
    const email =  req.body.mail;
    const mdp =  req.body.pwd;

    console.log(pseudo+prenom+nom+email+mdp)
    // Prenom doit etre compris entre 1 et 45 exclus 
    if (!(prenom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("taille prenom pas bonne")
        res.sendStatus(403)
    }
    console.log("prenom ok")
    // Nom doit être compris entre 1 et 44 inclus 
    if (!(nom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("nom incorrect")
        res.sendStatus(404)
    }
    console.log("nom ok")

    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("pseudo pas ok")
        res.sendStatus(405)
    }
    console.log("pseudo ok")

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    }
    console.log("mdp")

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    }
    console.log("email ok")


    // Hashage du mot de passe
    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            console.log(err)
        }
        // On fait des vérifications sur les insertions avant d'insérer dans BD
        // La base de données a déjà des contraintes
        // Verification d'unicité du pseudo 
        db.query('SELECT * FROM eleve WHERE pseudo = ?', [pseudo], (error, results) => {
            if (results.length > 0) {
                console.log("Pseudo pas unique");
                res.sendStatus(408)
            } else {
                console.log("pseudo valide")
                // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
                db.query('SELECT * FROM eleve WHERE courriel = ?', [email], (error, results) => {
                    if (results.length > 0) {
                        console.log("Mail pas unique");
                        res.sendStatus(409)
                    } else {
                        console.log("Mail unique parmi les élèves")
                        //  On vérifie que l'email n'est pas possèdé par une classe 
                        db.query('SELECT * FROM classe WHERE courriel = ?', [email], (error, results) => {
                            if (results.length > 0) {
                                console.log("Mail existant pour la classe");
                                res.sendStatus(410)
                            } else {
                                console.log("mdp" + hash)
                                console.log("Mail valide (unique dans la bd)");
                                db.query("INSERT INTO eleve(pseudo, prenom, nom, courriel, motdepasse) VALUES (?, ?, ?, ?, ?)", [pseudo, prenom, nom, email, hash],
                                    function (error, results, fields) {
                                        if (error) {
                                            /*if (error.sqlState == '50001') {
                                                console.log("mail existant dans classe ");
                                            } else {
                                                console.log(error)
                                            }*/
                                            console.log(error)
                                        } else {
                                            console.log("création de compte réussie")
                                            res.send(results)
                                        }
                                    }
                                );
                            }
                        }
                        );
                    }
                }
                );
            }
        }
        );
    }

    )
});

// adresse du serveur, pour faire des tests
app.listen(3500, () => {
    console.log("Serveur en marche")
}
);