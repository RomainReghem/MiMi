//const db = require('../utils/database');
const Sequelize = require('sequelize')
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken")

const Users = require('../models/users');
const { getInvitation } = require('./eleve');
const { response } = require('express');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

require('dotenv').config()

let refreshTokens = [];

/**
 * Permet de valider ou non la connexion d'un utilisateur (élève ou classe.)
 * Génère des tokens si l'authentification est validée
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const Connexion = (req, res) => {
    console.log("\n*** Connexion ***")

    const pseudo = req.body.user;
    const mdp = req.body.pwd;
    console.log("connexion " + mdp + " " + pseudo)
    if (mdp == "" || pseudo == "") {
        res.sendStatus(402)
    }
    Eleve.findOne({
        where:
            { courriel: pseudo }
    })
        .then(eleve => {
            if (eleve) {
                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                    // si le mot de passe entré correspond bien au mot de passe dans la base de données
                    if (estValide) {
                        console.log("** Création des cookies pour l'élève **")
                        // cookie 
                        const accessToken = jwt.sign(
                            { "UserInfo": { "mail": eleve.courriel, "role": "eleve" } },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '10m' }
                        );
                        const refreshToken = jwt.sign(
                            { "mail": eleve.courriel, "role": "eleve" },
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: '1d' }
                        )
                        refreshTokens.push(refreshToken);
                        //console.log("refresh token connexion " + refreshToken)
                        console.log("** Connexion de l'élève effectuée **")
                        getInvitation(eleve.courriel, function (reponse) {
                            console.log('dans la fonciton')
                            if (reponse == 404 || reponse == 407) {
                                return res.sendStatus(reponse)
                            } else {
                                let json = reponse
                                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                json = Object.assign({ role: "eleve", accessToken: accessToken }, json)
                                res.status(200).json(json)
                            }
                        })
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
}

module.exports = { refreshTokens, Connexion };