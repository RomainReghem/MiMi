const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;
const Refresh = Users.RefreshToken;

const { getInvitation } = require('./eleve');

const Modification = require('../controllers/modification.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Change le pseudo de l'élève dans la base de données.
 * Utilise l'email, l'ancien pseudo et le mot de passe donnés par le client.
 * Vérifie la validité des informations et le fait que le pseudo soit unique.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementPseudo = (req, res) => {
    console.log("\n*** Changement du pseudo ***")
    const email = req.body.mail;
    const pseudo = req.body.newPseudo;
    console.log("email " + email + " new " + pseudo)

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(407)
    }
    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("forme pseudo incorrect")
        return res.sendStatus(405)
    }

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut changer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({ attributes: ['ideleve', 'pseudo'], where: { courriel: email } })
            .then(eleveToChange => {
                if (!eleveToChange) {
                    return res.status(401).send("Eleve pas trouvé")
                }
                // si le pseudo actuel est différent de l'ancien, sinon on ne change rien
                if (eleveToChange.pseudo != pseudo) {
                    Eleve.update(
                        { pseudo: pseudo },
                        { where: { ideleve: eleveToChange.ideleve } }
                    ).then(newEleve => {
                        if (newEleve) {
                            //res.sendStatus(201)
                            return res.status(201).send("Modification de pseudo réussie.")
                        } else {
                            return res.status(520).send("non défini")
                        }

                    }).catch(err => {
                        console.log(err)
                        return res.status(500).send("Erreur lors de la modification de pseudo.")
                    })
                } else {
                    //res.send(eleveToChange);
                    return res.status(201).send("Pas de modification de pseudo.")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        return res.send("Pas un élève / pas le bon élève").status(403)
    }

}

/**
 * Change la valeur d'invitation à aucune et l'id de classe à null
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const SuppressionClasse = (req, res) => {
    console.log("\n*** Suppression de l'invititaion d'une classe pour un élève ***")
    const email = req.body.user;

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut supprimer /refuser une invitation de classe son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Modification.setInvitation("aucune", email, "", function (code) {
            console.log("Code " + code)
            if (code == 201) {
                return res.status(201).send("Suppression de classe réussie !")
            }
            return res.status(code).send("Erreur")
        })
    } else {
        return res.send("Pas un élève / pas le bon élève").status(403)
    }
}

/**
 * Change la valeur d'invitation à acceptee et l'id de classe à l'id de la classe dont on reçoit le mail
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const AcceptationInvitation = (req, res) => {
    console.log("\n*** Acceptation de l'invitation d'une classe ***")
    const email = req.body.user;
    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut changer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        /// RECUP MAIL CLASSE 
        Eleve.findOne({
            attributes: ["idclasse"],
            where: { courriel: email }
        })
            .then(eleve => {
                if (!eleve) {
                    return res.sendStatus(404)
                }
                Classe.findOne({ attributes: ['courriel'], where: { idclasse: eleve.idclasse } })
                    .then(classe => {
                        if (!classe) {
                            return res.sendStatus(404)
                        }
                        Modification.setInvitation("acceptee", email, classe.courriel, function (code) {
                            if (code == 201) {
                                return res.status(201).send("Acceptation de la classe réussie !")
                            }
                            return res.status(code).send("Erreur")
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        return res.send(err).status(520)
                    });
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        return res.send("Pas un élève / pas le bon élève").status(403)
    }
}

const ChangementMdp = (req, res) => {
    console.log("\n***Changement mdp eleve***")

    let email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;

    console.log("** Vérification validité informations **")

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.sendStatus(406)
    }
    if (!(newMdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.sendStatus(406)
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(407)
    }
    if (mdp == newMdp) {
        console.log("Mot de passe inchangé !")
        return res.status(406).status("Mot de passe inchangé !")
    }

    const role = req.role;
    const emailToken = req.mail
    // seul une classe peut changer son propre mot de passe
    if (role == "eleve" && email == emailToken) {
        // on cherche un eleve qui a le mail donné
        Eleve.findOne({ attributes: ['ideleve', 'motdepasse'], where: { courriel: email } })
            .then(eleve => {
                if (!eleve) {
                    return res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // on vérifie maintenant dans la bd si le mdp donné est bien celui associé au mail
                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                    if (estValide) {
                        console.log("Bon mot de passe de l'élève")
                        bcrypt.hash(newMdp, 10, (err, hash) => {
                            if (err) {
                                //erreur lors du hahage
                                return res.sendStatus(300)
                            }
                            // on change le mdp
                            Eleve.update(
                                { motdepasse: hash },
                                { where: { ideleve: eleve.ideleve } }
                            ).then(neweleve => {
                                if (!neweleve) {
                                    return res.status(404).send("pas d'eleve changé")
                                }
                                // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                res.send(neweleve)
                            })
                                .catch(err => {
                                    console.log(err)
                                    return res.send(err).status(520)
                                });
                        });
                    } else {
                        console.log("Mauvais mot de passe ELEVE")
                        return res.sendStatus(400)
                    }
                });
            }).catch(err => {
                return res.send(err).status(520)
            });
    } else {
        return res.status(403).send("Accès interdit : tentative de changement de mot de passe d'un élève !")
    }
}


const ChangementMail = (req, res) => {
    console.log("\n*** Changement de l'adresse mail d'un élève ***")
    let email = req.body.mail;
    const newEmail = req.body.newMail;
    const mdp = req.body.pwd;
    console.log("email " + email + " new " + newEmail + " mdp " + mdp)

    console.log("** Vérification mail **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.sendStatus(406)
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length || !(newEmail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= newEmail.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(407)
    }
    if (newEmail == email) {
        console.log("mails identiques")
        return res.status(200).send("Mail identiques : pas de changement")
    }

    const role = req.role;
    const emailToken = req.mail
    console.log("emial " + email + "token " + emailToken + "role" + role)
    // seul un élève peut changer son propre mail
    if (role == "eleve" && email == emailToken) {
        // on cherche un eleve qui a le mail donné
        Eleve.findOne({ attributes: ['ideleve', 'motdepasse'], where: { courriel: email } })
            .then(eleve => {
                // un eleve est bien associé à l'ancien mail
                if (!eleve) {
                    return res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
                Eleve.findOne({ attributes: ['ideleve'], where: { courriel: newEmail } })
                    .then(eleve2 => {
                        if (eleve2) {
                            console.log("Mail pas unique");
                            return res.sendStatus(409)
                        }
                        // console.log("mail unique pour eleves");
                        Classe.findOne({ attributes: ['idclasse'], where: { courriel: newEmail } })
                            .then(classe => {
                                if (classe) {
                                    console.log("Mail existant pour la classe");
                                    res.sendStatus(410)
                                } else {
                                    // on vérifie maintenant dans la bd si le mdp donné est bien celui associé au mail
                                    bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                                        if (estValide) {
                                            console.log("Bon mot de passe de l'élève")
                                            // Comme on a changé l'adresse mail, on doit aussi changer les tokens
                                            const cookies = req.cookies;
                                            //console.log("refresh cookies" + cookies.jwt);
                                            if (!cookies?.jwt) {
                                                console.log("accès refusé")
                                                // 401 : authentification raté
                                                return res.status(401).send("Accès refusé : authentification requise")
                                            }
                                            // on crée de nouveaux token 
                                            console.log("*** Recréation des cookies pour l'élève ***")
                                            // cookie 
                                            const accessToken = jwt.sign(
                                                { "UserInfo": { "mail": newEmail, "role": "eleve" } },
                                                process.env.ACCESS_TOKEN_SECRET,
                                                { expiresIn: '10m' }
                                            );
                                            const refreshToken = jwt.sign(
                                                { "mail": newEmail, "role": "eleve" },
                                                process.env.REFRESH_TOKEN_SECRET,
                                                { expiresIn: '1d' }
                                            )
                                            Eleve.update(
                                                { courriel: newEmail, token: refreshToken },
                                                { where: { ideleve: eleve.ideleve } }
                                            ).then(newEleve => {
                                                if (!newEleve) {
                                                    return res.status(600).send("non défini")
                                                }
                                                console.log("Changement de mail ok")

                                                getInvitation(newEmail, function (reponse) {
                                                    if (reponse == 404 || reponse == 407) {
                                                        return res.sendStatus(reponse)
                                                    } else {
                                                        console.log("changement de mail ok")
                                                        let json = reponse
                                                        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                        json = Object.assign({ role: "eleve", accessToken: accessToken }, json)
                                                        return res.status(201).json(json)
                                                    }
                                                })
                                            }).catch(err => {
                                                console.log(err)
                                                return res.sendStatus(600)
                                            });
                                        } else {
                                            console.log("Mauvais mot de passe de l'eleve")
                                            return res.sendStatus(400)
                                        }
                                    });
                                }
                            }).catch(err => {
                                return res.send(err).status(600)
                            });
                    })
                    .catch(err => {
                        return res.send(err).status(600)
                    });
            });
    } else {
        return res.status(403).send("Accès interdit : tentative de changement de mail de l'eleve !")
    }
}


module.exports = { ChangementPseudo, SuppressionClasse, AcceptationInvitation, ChangementMail, ChangementMdp }