const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

const { getInvitation } = require('./eleve');
const {getAvatar, getImage} = require('./image')

const Modification = require('./modificationInvitation.js')
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
    //console.log("email " + email + " new " + pseudo)

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(407).send("La forme de l'adresse mail est incorrecte.")
    }
    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("forme pseudo incorrect")
        return res.status(405).send("Le pseudo ne respecte pas les règles.")
    }

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut changer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({ attributes: ['ideleve', 'pseudo'], where: { courriel: email } })
            .then(eleveToChange => {
                if (!eleveToChange) {
                    return res.status(401).send("L'élève n'a pas été trouvé")
                }
                // si le pseudo actuel est différent de l'ancien, sinon on ne change rien
                if (eleveToChange.pseudo != pseudo) {
                    Eleve.update(
                        { pseudo: pseudo },
                        { where: { ideleve: eleveToChange.ideleve } }
                    ).then(() => {
                        return res.status(201).send("Modification de pseudo réussie.");
                    }).catch(err => {
                        console.log("erreur UPDATE ON ELEVE " + err)
                        return res.status(520).send("Erreur lors de la modification de pseudo.")
                    })
                } else {
                    return res.status(204).send("Pas de modification de pseudo.")
                }
            })
            .catch(err => {
                console.log("error eleve findone " + err)
                return res.status(520).send("Erreur survenue lors de la vérification des données")
            });
    } else {
        return res.status(403).send("Pas un élève / pas le bon élève : accès interdit")
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
        return res.status(403).send("Pas un élève / pas le bon élève : accès interdit")
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
                    return res.status(404).send("Aucun élève correspondant à l'adresse : %s", email)
                }
                Classe.findOne({ attributes: ['courriel'], where: { idclasse: eleve.idclasse } })
                    .then(classe => {
                        if (!classe) {
                            return res.status(404).send("Aucune classe trouvée.")
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
                        return res.status(520).send(err)
                    });
            })
            .catch(err => {
                console.log(err)
                return res.status(520).send(err)
            });
    } else {
        return res.status(403).send("Pas un élève / pas le bon élève")
    }
}


/**
 * Permet, si les données sont valides, de changer dans la base de données le mot de passe de l'élève
 * @param {*} req la requête du client, contient dans son corps (body) :  
 * • mail : le mail de l'élève dont on veut changer le mot de passe
 * • pwd : le mot de passe actuel de l'élève, celui que l'on veut changer
 * • newPwd : le nouveau mot de passe de l'élève, celui qui va remplacer l'ancien
 * @param {*} res permet de stocker la réponse du serveur
 * @returns la réponse du serveur, avec un code HTTP (d'erreur ou de succès) et un message
 */
const ChangementMdp = (req, res) => {
    console.log("\n***Changement mdp eleve***")

    let email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;

    console.log("** Vérification validité informations **")

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.status(406).send("Le mot de passe actuel n'est pas de la bonne forme ! ")
    }
    if (!(newMdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.status(406).send("Le nouveau mot de passe n'est pas de la bonne forme !")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(407).send("L'adresse mail fournie n'est pas de la bonne forme !")
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
                // si aucun changement, on ne fait pas de vérifications
                if (mdp == newMdp) {
                    console.log("Mot de passe inchangé !")
                    return res.status(204).send("Mot de passe inchangé !");
                }
                // on vérifie maintenant dans la bd si le mdp donné est bien celui associé au mail
                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                    if (estValide) {
                        console.log("Bon mot de passe de l'élève")
                        bcrypt.hash(newMdp, 10, (err, hash) => {
                            if (err) {
                                //erreur lors du hahage
                                console.log("error bcrypt : " + err)
                                return res.status(520).send("Erreur lors du chiffrement du mot de passe")
                            }
                            // on change le mdp
                            Eleve.update(
                                { motdepasse: hash },
                                {
                                    where: { ideleve: eleve.ideleve }
                                }).then(() => {
                                    // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                    return res.status(201).send("Le mot de passe a bien été modifié !")
                                }).catch(err => {
                                    console.log("error update table eleve " + err)
                                    return res.status(520).send("Erreur survenue lors de la modification du mot de passe !")
                                });
                        });
                    } else {
                        console.log("Mauvais mot de passe ELEVE " + err)
                        return res.status(400).send("Le mot de passe fourni n'est pas le bon")
                    }
                });
            }).catch(err => {
                console.log("error findOne on Eleve : " + err)
                return res.status(520).send("Erreur lors de la vérification du compte !")
            });
    } else {
        console.log("Accès interdit : tentative de changement de mot de passe d'un élève %s par %s! ", email, emailToken)
        return res.status(403).send("Accès interdit : tentative de changement de mot de passe d'un élève !")
    }
}


/**
 * Permet de changer l'adresse mail de la classe avec la nouvelle adresse mail fournie, si les données sont valides et que le mot de passe correspond.
 * @param {*} req la requête du client, contient dans le body :  
 * • mail : l'adresse mail actuelle de l'élève, celle que l'on veut remplacer
 * • newMail : la nouvelle adresse mail de l'élève, celle qui va remplacer l'ancienne
 * • pwd : le mot de passe de l'élève
 * @param {*} res va contenir la réponse du serveur
 * @returns la réponse du serveur, erreur ou succès
 */
const ChangementMail = (req, res) => {
    console.log("\n*** Changement de l'adresse mail d'un élève ***")
    let email = req.body.mail;
    const newEmail = req.body.newMail;
    const mdp = req.body.pwd;
    // console.log("email " + email + " new " + newEmail + " mdp " + mdp)

    console.log("** Vérification mail **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.status(406).send("Le mot de passe n'est pas de la bonne forme ! ")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length || !(newEmail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= newEmail.length) {
        console.log("forme mail incorrect")
        return res.status(407).send("L'adresse mail fournie n'est pas de la bonne forme !")
    }
    if (newEmail == email) {
        console.log("mails identiques")
        return res.status(204).send("Mail identiques : pas de changement")
    }

    const role = req.role;
    const emailToken = req.mail
    // console.log("emial " + email + "token " + emailToken + "role" + role)
    // seul un élève peut changer son propre mail
    if (role == "eleve" && email == emailToken) {
        // on cherche un eleve qui a le mail donné
        Eleve.findOne({ attributes: ['ideleve', 'motdepasse', "pseudo"], where: { courriel: email } })
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
                            return res.status(409).send("Un élève possède déjà cette adresse mail !")
                        }
                        // console.log("mail unique pour eleves");
                        Classe.findOne({ attributes: ['idclasse'], where: { courriel: newEmail } })
                            .then(classe => {
                                if (classe) {
                                    console.log("Mail existant pour la classe");
                                    return res.status(410).send("Une classe est déjà enregistrée avec cette adresse mail !")
                                }
                                // on vérifie maintenant dans la bd si le mdp donné est bien celui associé au mail
                                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                                    if (err) {
                                        console.log("error on bcrypt compare : " + err)
                                        return res.status(520).send("Erreur lors de la vérification du mot de passe !")
                                    }
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
                                        console.log("** Recréation des cookies pour l'élève **")
                                        // cookie 
                                        const accessToken = jwt.sign(
                                            { "UserInfo": { "mail": newEmail, "role": "eleve" } },
                                            process.env.ACCESS_TOKEN_SECRET,
                                            { expiresIn: '20m' }
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
                                                return res.status(600).send("Erreur lors du changement du mail de l'élève")
                                            }
                                            console.log("Changement de mail ok")
                                            // On récupère des informations sur l'élève pour les renvoyer au client
                                            getInvitation(newEmail, function (reponse) {
                                                if (reponse == 404 || reponse == 400 || reponse==520) {
                                                    return res.sendStatus(reponse)
                                                } else {
                                                    // pour récupérer l'avatar de l'élève
                                                    getAvatar(eleve.ideleve, function (reponseAvatar) {
                                                        //pour récupèrer l'image de profil de l'élève 
                                                        getImage(eleve.courriel, function (err, reponseImage) {
                                                            if (err) {
                                                                return res.status(520).send(err);
                                                            }
                                                            console.log('envoi des infos')
                                                            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                            return res.status(200).json(Object.assign({ role: "eleve", accessToken: accessToken }, reponse, { pseudo: eleve.pseudo }, reponseAvatar, reponseImage));
                                                        })
                                                    })
                                                }
                                            })
                                        }).catch(err => {
                                            console.log("error UPDATE on ELEVE : " + err)
                                            return res.status(520).send("Erreur lors de l'enregistrement du nouveau mail.")
                                        });
                                    } else {
                                        console.log("Mauvais mot de passe de l'eleve ")
                                        return res.status(400).send("Ce n'est pas le bon mot de passe !")
                                    }
                                });
                            }).catch(err => {
                                console.log("error CLASSE findone : " + err).status
                                return res.status(600).send("Erreur survenue lors de la vérification de l'unicité de la nouvelle adresse")
                            });
                    })
                    .catch(err => {
                        console.log("error ELEVE findone : " + err).status;
                        return res.status(600).send("Erreur survenue lors de la vérification de l'unicité de la nouvelle adresse");
                    });
            });
    } else {
        return res.status(403).send("Accès interdit : tentative de changement de mail de l'eleve !")
    }
}


module.exports = { ChangementPseudo, SuppressionClasse, AcceptationInvitation, ChangementMail, ChangementMdp }