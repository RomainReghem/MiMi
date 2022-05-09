//const db = require('../utils/database');
const Sequelize = require('sequelize')
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken")

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

require('dotenv').config()

let refreshTokens = [];

const Connexion = (req, res) => {
    const pseudo = req.body.user;
    const mdp = req.body.pwd;
    console.log("connexion " + mdp + " " + pseudo)
    if (mdp == "" || pseudo == "") {
        res.sendStatus(402)
    }
    Eleve.findOne({
        where: //Sequelize.or(
            //{ pseudo: pseudo },
            { courriel: pseudo }
        //) 
    })
        .then(eleve => {
            if (eleve) {
                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                    if (estValide) {
                        console.log("\n*** Création des cookies pour l'élève ***")
                        // cookie 
                        const accessToken = jwt.sign(
                            { "UserInfo": { "mail": eleve.courriel, "role": "eleve" } },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '10m' }
                        );
                        const refreshToken = jwt.sign(
                            { "mail": eleve.courriel, "role": "eleve" },
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: '30m' }
                        )
                        refreshTokens.push(refreshToken);
                        //console.log("refresh token connexion " + refreshToken)
                        console.log("*** Connexion de l'élève effectuée ***")

                        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                        res.status(200).json({ role: "eleve", accessToken: accessToken })
                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                        //res.send(eleve)
                    } else {
                        console.log("Mauvais mot de passe ELEVE")
                        // sinon, si ce n'est pas le bon mdp mais le bon pseudo
                        res.sendStatus(400)
                    }
                });
            } else if (pseudo.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) {
                Classe.findOne({ where: { courriel: pseudo } })
                    .then(classe => {
                        if (classe) {
                            bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                if (estValide) {
                                    console.log("Création des cookies pour la classe")
                                    // cookie 
                                    const accessToken = jwt.sign(
                                        {
                                            "UserInfo": {
                                                "mail": classe.courriel,
                                                "role": "classe"
                                            }
                                        },
                                        process.env.ACCESS_TOKEN_SECRET,
                                        { expiresIn: '10m' }
                                    );
                                    const refreshToken = jwt.sign(
                                        { "mail": classe.courriel, "role": "classe" },
                                        process.env.REFRESH_TOKEN_SECRET,
                                        { expiresIn: '1d' }
                                    )
                                    refreshTokens.push(refreshToken);
                                    //console.log("refresh token connexion " + refreshToken)

                                    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                    res.status(201).json({ role: "classe", accessToken: accessToken })
                                    console.log("CONNEXION de la classe OK")
                                    // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                    //res.send(classe)
                                } else {
                                    console.log("Mauvais mot de passe CLASSE")
                                    // si ce n'est pas le bon mdp mais le bon pseudo
                                    res.sendStatus(400)
                                }
                            });
                        } else {
                            // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
                            console.log("Utilisateur pas trouvé Classe")
                            // si pour le pseudo donné, aucun utilisateur ne correspond 
                            res.sendStatus(401);
                        }
                    });
            } else {
                // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
                console.log("Utilisateur pas trouvé ELEVE")
                // si pour le pseudo donné, aucun utilisateur ne correspond 
                res.sendStatus(401);
            }
        })
        .catch(err => {
            console.log("error" + err);
        })
    /* db.query('SELECT * FROM eleve WHERE pseudo = ? OR courriel = ?', [pseudo, pseudo], function (error, results, fields) {
         // En cas d'erreur
         if (error) throw error;
         // Si le compte existe
         if (results.length > 0) {
             bcrypt.compare(mdp, results[0].motdepasse, function (err, estValide) {
                 if (estValide) {
                     console.log("Connexion de l'élève OK")
                     // si le mot de passe entré correspond bien au mot de passe dans la base de données
                     res.send(results)
                 } else {
                     console.log("Mauvais mot de passe ELEVE")
                     // sinon, si ce n'est pas le bon mdp mais le bon pseudo
                     res.sendStatus(400)
                 }
             });
             // Si la valeur entrée est un email, il se peut qu'il appartiennent à la classe
         } else if (pseudo.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) {
             console.log("test adr mail classe")
             db.query('SELECT * FROM classe WHERE courriel = ?', [pseudo], function (error, results, fields) {
                 // En cas d'erreur
                 if (error) throw error;
                 if (results.length > 0) {
                     // on compare le mdp hashé de la bd avec le mdp rentré par l'utilisateur, bcrypt permet de faire la comparaison
                     bcrypt.compare(mdp, results[0].motdepasse, function (err, estValide) {
                         if (estValide) {
                             // cookie 
                             const accessToken = jwt.sign(
                                 { "mail": results[0].courriel },
                                 process.env.ACCESS_TOKEN_SECRET,
                                 { expiresIn: '5m' }
                             );
                             const refreshToken = jwt.sign(
                                 { "mail": results[0].courriel },
                                 process.env.ACCESS_TOKEN_SECRET,
                                 { expiresIn: '30m' }
                             )
                             refreshTokens.push(refreshToken);
                             res.cookie('jwt',refreshToken, {httpOnly :true, maxAge: 24*60*60*1000})
                             res.json({accessToken: accessToken})
                             console.log("CONNEXION de la classe OK")
                             // si le mot de passe entré correspond bien au mot de passe dans la base de données
                             res.send(results)
                         } else {
                             console.log("Mauvais mot de passe CLASSE")
                             // si ce n'est pas le bon mdp mais le bon pseudo
                             res.sendStatus(400)
                         }
                     });
                 } else {
                     // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
                     console.log("Utilisateur pas trouvé Classe")
                     // si pour le pseudo donné, aucun utilisateur ne correspond 
                     res.sendStatus(401);
                 }
             });
 
         } else {
             // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
             console.log("Utilisateur pas trouvé ELEVE")
             // si pour le pseudo donné, aucun utilisateur ne correspond 
             res.sendStatus(401);
         }
     });*/
}

const Deconnexion = (req, res) => {
    console.log("Debut deconnexion")
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        console.log("pas de cookie")
        // Ne retourne pas d'erreur, il n'y avait pas de cookies
        res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;
    console.log("DECONNEXION refreshToken : " + refreshToken)
    // retire de la liste des refresh token le refresh token
    refreshTokens = refreshTokens.filter(
        (c) => c != refreshToken
    );

    // On vide le cache des cookies
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);

}

/*const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, "YOUR_SECRET_KEY");
      req.userId = data.id;
      req.userRole = data.role;
      return next();
    } catch {
      return res.sendStatus(403);
    }
  };*/

module.exports = { refreshTokens, Connexion, Deconnexion };