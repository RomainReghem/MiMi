const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cors = require("cors");
const path = require('path');

// Pour le hashage du mot de passe
const bcrypt = require('bcrypt');

/* On crée une connexion à la database : pour l'instant elle est en local (localhost)
 On rentre le nom d'utilisateur et le mot de passe
 Puis le nom de la base de données
*/
const connexion = mysql.createConnection({
    host: 'localhost',
    user: 'projetmimi',
    password: 'mdpmimi!',
    database: 'db_mimi'
});
const app = express();

app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
/*app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));*/

app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);

// CONNEXION
app.post("/connexion", (req, res) => {
   /* const pseudo = "eleve8";
    const mdp = "testor";*/
    const pseudo = req.body.user;
    const mdp = req.body.pwd;
    console.log("connexion "+mdp+ " "+pseudo )
    if(mdp=="" || pseudo==""){
        res.sendStatus(402)
    }
    connexion.query('SELECT * FROM eleve WHERE pseudo = ? OR courriel = ?', [pseudo, pseudo], function (error, results, fields) {
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
            console.log("UTILISATEUR NOT FOUND")

            // si pour le pseudo donné, aucun utilisateur ne correspond 
            res.sendStatus(401);
        }
    });
});

// INSCRIPTION
app.post("/inscription", (req, res) => {
    const pseudo = "eleve9";
    const prenom = "t";
    const nom = "";
    const email = "eleve9@test.fr";
    const mdp = "testor";

    // Prenom doit etre compris entre 1 et 45 exclus 
    if (45 <= prenom.length || 1 >= prenom.length) {
        console.log("taille prenom pas bonne")
    }
    // Nom doit être compris entre 1 et 44 inclus 
    if (44 < nom.length) {
        console.log("taille nol trop longue")
    }
    if (3 > pseudo.length || 45 <= pseudo.length) {
        console.log("taille pseudo pas ok")
    }
    if (6 > mdp.length || 100 <= mdp.length) {
        console.log("taille mdp pas ok")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
    }

    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            console.log(err)
        }

        // On fait des vérifications sur les insertions avant d'insérer dans BD
        // La base de données a déjà des contraintes
        // Verification d'unicité du pseudo 
        connexion.query('SELECT * FROM eleve WHERE pseudo = ?', [pseudo], (error, results) => {
            let valide = true;
            if (results.length > 0) {
                console.log("Pseudo pas unique");
            } else {
                console.log("pseudo valide")
                // Verificat
                connexion.query('SELECT * FROM eleve WHERE courriel = ?', [email], (error, results) => {
                    if (results.length > 0) {
                        console.log("Mail pas unique");
                    } else {
                        console.log("Mail unique parmi les élèves")
                        connexion.query('SELECT * FROM classe WHERE courriel = ?', [email], (error, results) => {
                            if (results.length > 0) {
                                console.log("Mail existant pour la classe");
                            } else {
                                console.log("mdp" + hash)
                                console.log("Mail valide (unique dans la bd)");
                                connexion.query("INSERT INTO eleve(pseudo, prenom, nom, courriel, motdepasse) VALUES (?, ?, ?, ?, ?)", [pseudo, prenom, nom, email, hash],
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

app.listen(3500, () => {
    console.log("Serveur en marche")
}
);