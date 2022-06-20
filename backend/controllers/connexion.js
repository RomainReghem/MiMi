const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken")

const Users = require('../models/users');
//const { getAvatar, getImage, getAvatarAsImage } = require("./image")
const { getAvatar, getImage, getAvatarAsImage } = require("./imagePromise")
const { getInvitation } = require('./eleve');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

require('dotenv').config()


/**
 * Permet de valider ou non la connexion d'un utilisateur (élève ou classe.)
 * Génère des tokens si l'authentification est validée
 * 
 * @param {*} req la requête du client, doit contenir :  
 * • user : l'adresse mail utilisée pour se connecter
 * • pwd : le mot de passe en clair utilisé pour se connecter
 * @param {*} res la réponse du serveur
 */
const Connexion = (req, res) => {
    //console.log("\n*** Connexion ***")
    // console.log("connexion.js -> Connexion")

    const email = req.body.user;
    const mdp = req.body.pwd;
    //console.log("connexion " + mdp + " " + email)
    if (mdp == "" || email == "") {
        console.log("Err controllers/connexion.js > Connexion : mdp ou mail vide")
        return res.status(402).send("Mot de passe ou mail vide");
    }
    // on regarde si le mail correspond à un élève
    Eleve.findOne({
        attributes: ['motdepasse', 'courriel', 'pseudo'],
        where:
            { courriel: email }
    })
        .then(eleve => {
            // si le mail correspond à un compte d'un élève, on va comparer le mdp donné
            if (eleve) {
                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                    // si le mot de passe entré correspond bien au mot de passe dans la base de données
                    if (estValide) {
                        //console.log("** Création des cookies pour l'élève **")
                        // l'acces token se périme au bout de 20 min sans activités
                        const accessToken = jwt.sign(
                            { "UserInfo": { "mail": eleve.courriel, "role": "eleve" } },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '20m' }
                        );
                        // le refreshtoken permet de créer de nouveaux accesstoken, il dure donc plus de temps, 1jour
                        const refreshToken = jwt.sign(
                            { "mail": eleve.courriel, "role": "eleve" },
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: '1d' }
                        )
                        // on met à jour la table Eleve pour pouvoir enregistrer le nouveau token dedans
                        Eleve.update(
                            { token: refreshToken },
                            { where: { courriel: eleve.courriel } }
                        )
                            .then(() => {
                                //console.log("refresh token connexion " + refreshToken)
                                //console.log("** Connexion de l'élève effectuée **")
                                // pour récupérer le statut de l'invitation de l'élève
                               /* getInvitation(eleve.courriel, function (reponse) {
                                    if (reponse == 404 || reponse == 400 || reponse == 520) {
                                        console.log("Err controllers/connexion.js > Connexion : erreur lors de la récupération de l'invitation code " + reponse)
                                        return res.sendStatus(reponse)
                                    } else {
                                        // pour récupérer l'avatar de l'élève
                                        getAvatar(eleve.courriel, function (err, reponseAvatar) {
                                            if (err) {
                                                return res.status(520).send(err);
                                            }
                                            //pour récupèrer l'image de profil de l'élève 
                                            getImage(eleve.courriel, function (err, reponseImage) {
                                                if (err) {
                                                    return res.status(520).send(err);
                                                }
                                                getAvatarAsImage(eleve.courriel, function (err, reponseAvatarAsImage) {
                                                    if (err) {
                                                        return res.status(520).send(err);
                                                    }
                                                    //console.log('envoi des infos')
                                                    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                    return res.status(200).json(Object.assign({ role: "eleve", accessToken: accessToken }, reponse, { pseudo: eleve.pseudo }, reponseAvatar, reponseAvatarAsImage, reponseImage));
                                                })

                                            })
                                        })
                                    }
                                })
                                */
                                getInvitation(eleve.courriel, function (reponse) {
                                    if (reponse == 404 || reponse == 400 || reponse == 520) {
                                        console.log("Err controllers/connexion.js > Connexion : erreur lors de la récupération de l'invitation code " + reponse)
                                        return res.sendStatus(reponse)
                                    } else {
                                        Promise.all([
                                            getImage(eleve.courriel),
                                            getAvatarAsImage(eleve.courriel),
                                            getAvatar(eleve.courriel),
                                        ])
                                            .then((data) => {
                                                //envoi des infos recuperees sur l'eleve
                                                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                return res.status(200).json(Object.assign({ role: "eleve", accessToken: accessToken }, reponse, {image:data[0].image}, {avatarAsImg:data[1].avatarAsImg}, {avatar :data[2].avatar}));
                                            }
                                            ).catch((err) => {
                                                console.log(err)
                                                return res.status(520).send("Erreur du serveur lors de la récupération des informations du serveur.")
                                            })
                                    }
                                })

                            })
                            .catch(err => {
                                console.log("Err controllers/connexion.js > Connexion : erreur lors de l'ajout de Token" + err);
                                return res.status(520).send("Erreur lors de l'ajout de cookies.")
                            })
                    } else {
                        console.log("Err controllers/connexion.js > Connexion : mauvais mot de passe ELEVE" + err)
                        // sinon, si ce n'est pas le bon mdp mais le bon email
                        return res.status(400).send("Ce n'est pas le bon mot de passe.")
                    }
                });
            } else {
                Classe.findOne({
                    attributes: ['courriel', 'motdepasse', 'idclasse'],
                    where: { courriel: email }
                })
                    .then(classe => {
                        if (classe) {
                            bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                if (estValide) {
                                    //console.log("Création des cookies pour la classe")
                                    const accessToken = jwt.sign(
                                        {
                                            "UserInfo": {
                                                "mail": classe.courriel,
                                                "role": "classe"
                                            }
                                        },
                                        process.env.ACCESS_TOKEN_SECRET,
                                        { expiresIn: '20m' }
                                    );
                                    const refreshToken = jwt.sign(
                                        { "mail": classe.courriel, "role": "classe" },
                                        process.env.REFRESH_TOKEN_SECRET,
                                        { expiresIn: '1d' }
                                    );
                                    Classe.update({ token: refreshToken }, { where: { idclasse: classe.idclasse } })
                                        .then(() => {
                                            // console.log("CONNEXION de la classe OK")
                                            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                            return res.status(201).json({ role: "classe", accessToken: accessToken, idclasse: classe.idclasse })
                                            // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                            //res.send(classe)
                                        }).catch(err => {
                                            console.log("Err controllers/connexion.js > Connexion : update classe " + err);
                                            return res.status(520).send("Erreur lors de l'enregistrement des cookies.")
                                        })
                                } else {
                                    console.log("Err controllers/connexion.js > Connexion : mauvais mot de passe CLASSE")
                                    // si ce n'est pas le bon mdp mais le bon email
                                    return res.status(400).send("Ce n'est pas le bon mot de passe.")
                                }
                            });
                        } else {
                            // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
                            console.log("Err controllers/connexion.js > Connexion : Utilisateur pas trouvé.")
                            // si pour l'adresse mail donnée, aucun utilisateur ne correspond 
                            return res.status(401).send("Aucun utilisateur correspondant à cette adresse mail trouvé.");
                        }
                    })
                    .catch(err => {
                        // console.log(err);
                        console.log("Err controllers/connexion.js > Connexion : erreur impossible de récupérer les informations de la classe: " + err)
                        return res.status(520).send("Erreur survenue lors de la vérification du compte.")
                    })
            }
        })
        .catch(err => {
            // console.log(err);
            console.log("Err controllers/connexion.js > Connexion :  délai d'attente dépassé eleve findone " + err)
            return res.status(504).send("Problème au niveau du serveur.");
        })
}


module.exports = { Connexion };