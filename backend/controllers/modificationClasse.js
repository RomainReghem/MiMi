const Modification = require('../controllers/modification.js')

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;
const Refresh = Users.RefreshToken;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Change la valeur d'invitation à en attente et l'id de classe à l'id de la classe dont on reçoit le mail
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ajoutInvitation = (req, res) => {
    console.log("\n*** Ajout de l'invitation de la classe ***")
    const email = req.body.eleve;
    const emailClasse = req.body.classe;

    const role = req.role;
    const emailToken = req.mail
    // seul une classe peut ajouter un eleve à la classe
    if (role == "classe" && emailToken == emailClasse) {
        Modification.setInvitation("en attente", email, emailClasse, function (code) {
            console.log("code ajout " + code)
            if (code == 201) {
                return res.status(201).send("Ajout de l'invitation de la classe réussie !")
            }
            return res.status(code).send("Erreur")
        })
    } else {
        console.log("Role %s inconnu ", role)
        return res.status(403).send("Accès interdit")
    }
}


/**
 * Change la valeur d'invitation à "aucune" et l'id de classe à rien
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const suppressionEleve = (req, res) => {
    console.log("\n*** Suppression de l'élève de la classe ***")

    const emailClasse = req.body.classe
    const role = req.role;
    const emailToken = req.mail
    // seul une classe peut supprimer un eleve de la classe
    if (role == "classe" && emailClasse == emailToken) {
        const email = req.body.eleve;
        Modification.setInvitation("aucune", email, "", function (code) {
            if (code == 201) {
                return res.status(201).send("Suppression de l'élève réussi !")
            }
            return res.status(code).send("Erreur")
        })
    } else {
        console.log("Role %s inconnu ", role)
        return res.status(403).send("Accès interdit")
    }
}

/**
 * Change dans la bd le mot de passe de la classe
 * @param {*} req la requête du client, contient le mail, l'ancien mot de passe et le nouveau mot de passe de la classe
 * @param {*} res la réponse du serveur
 * @returns la réponse 
 */
const changementMdpClasse = (req, res) => {
    console.log("\n***Changement mot de passe classe***")
    let email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;

    console.log("mail " + email + " mdp " + mdp + " newMdp " + newMdp)
    console.log("** Vérification mot de passe **")
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
    if (role == "classe" && email == emailToken) {
        Classe.findOne({ attributes: ['idclasse', 'motdepasse'], where: { courriel: email } })
            .then(classe => {
                if (!classe) {
                    res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // comparaion du mdp avec celui connu
                bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                    if (estValide) {
                        console.log("Bon mot de passe de la classe")
                        // on change le mdp
                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                        bcrypt.hash(newMdp, 10, (err, hash) => {
                            if (err) {
                                //erreur lors du hahage
                                return res.sendStatus(300)
                            }
                            const newclasse = Classe.update(
                                { motdepasse: hash },
                                { where: { idclasse: classe.idclasse } }
                            ).catch(err => {
                                return res.send(err).status(520)
                            });
                            // on envoie la classe avec le mdp modifié 
                            return res.send(newclasse).status(201)
                        });
                    }
                    if (err) {
                        return res.status(520).send(err)
                    }
                    // si le mot de passe
                    console.log("Mauvais mot de passe classe")
                    return res.sendStatus(400)
                });
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        return res.status(403).send("Accès interdit : tentative de changement de mot de passe de classe !")
    }
}

/**
 * Change dans la base de données l'adresse mail de la classe, et les tokens associés
 * @param {*} req la requête du client, contient l'ancien et le nouveau mail de la classe, ainsi que le mot de passe de la classe
 * @param {*} res la réponse du serveur
 */
const changementMailClasse = (req, res) => {
    console.log("\n***Changement mail classe***")
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
    // seul une classe peut changer son propre mail
    if (role == "classe" && email == emailToken) {
        // on cherche si il existe une classe correspondante à l'aide de l'ancien mail
        Classe.findOne({ attributes: ['idclasse', 'motdepasse'], where: { courriel: email } })
            .then(classe => {
                // s'il n'y aucune classe  qui a été trouvée alors aucun compte ne correspond à ce mail
                if (!classe) {
                    return res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // On vérifie que dans la table classe aucune classe ne possède déjà la nouvelle adresse mail
                Classe.findOne({ attributes: ['idclasse'], where: { courriel: newEmail } })
                    .then(classe2 => {
                        if (classe2) {
                            console.log("Mail existant pour la classe");
                            return res.status(409).send('Adresse déjà utilisée par un compte classe')
                        }
                        // on vérifie que l'adresse mail n'est aussi pas déjà prise par un élève
                        Eleve.findOne({ attributes: ['ideleve'], where: { courriel: newEmail } })
                            .then(eleve => {
                                // si on trouve un eleve, c'est qu'il est enregistré avec le nouveau mail
                                if (eleve) {
                                    console.log("Mail existant pour un eleve");
                                    return res.status(411).send('Adresse déjà utilisée par un élève')
                                }
                                // comparaion du mdp avec celui connu
                                bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                    if (estValide) {
                                        console.log("Bon mot de passe de la classe")
                                        // console.log("\n*** Recréation des tokens ***")
                                        const cookies = req.cookies;
                                        //console.log("refresh cookies" + cookies.jwt);
                                        if (!cookies?.jwt) {
                                            console.log("accès refusé")
                                            // 401 : authentification raté
                                            return res.status(401).send("Accès refusé : authentification requise")
                                        }
                                        console.log("** Recréation des cookies pour la classe **")

                                        const accessToken = jwt.sign(
                                            { "UserInfo": { "mail": newEmail, "role": "classe" } },
                                            process.env.ACCESS_TOKEN_SECRET,
                                            { expiresIn: '10m' }
                                        );
                                        const refreshToken = jwt.sign(
                                            { "mail": newEmail, "role": "classe" },
                                            process.env.REFRESH_TOKEN_SECRET,
                                            { expiresIn: '1d' }
                                        )
                                        // on change le mail
                                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                        Classe.update(
                                            {
                                                courriel: newEmail,
                                                token: refreshToken
                                            },
                                            { where: { idclasse: classe.idclasse } }
                                        ).then(newclasse => {
                                            if (newclasse) {
                                                console.log("update ok")

                                                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                return res.status(201).json({ role: "classe", accessToken: accessToken, idclasse: classe.idclasse })
                                                // on crée de nouveaux token 
                                                /* Refresh.findOne({ attributes: ['idtoken'], where: { token: refreshTokenOld } })
                                                     .then(token => {
                                                         if (!token) {
                                                             console.log("pas de token trouvé : accès interdit")
                                                             return res.status(403)
                                                         }
                                                         // cookie 
                                                         const accessToken = jwt.sign(
                                                             { "UserInfo": { "mail": newEmail, "role": "classe" } },
                                                             process.env.ACCESS_TOKEN_SECRET,
                                                             { expiresIn: '10m' }
                                                         );
                                                         const refreshToken = jwt.sign(
                                                             { "mail": newEmail, "role": "classe" },
                                                             process.env.REFRESH_TOKEN_SECRET,
                                                             { expiresIn: '1d' }
                                                         )
                                                         // on insère dans la liste le nouveau refreshtoken
                                                         Refresh.update({ token: refreshToken }, { where: { idtoken: token.idtoken } })
                                                             .then(() => {
                                                                 res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                                 return res.status(201).json({ role: "classe", accessToken: accessToken, idclasse: classe.idclasse })
                                                             }).catch(err => {
                                                                 console.log("erreur update token")
                                                                 return res.status(500).send("erreur update token " + err);
                                                             });
                                                     }).catch(err => {
                                                         return res.status(500).send("Erreur " + err);
                                                     });*/
                                            } else {
                                                return res.status(500).send("non défini")
                                            }
                                        }).catch(err => {
                                            return res.status(500).send("Erreur " + err);
                                        });

                                    } else {
                                        console.log("Mauvais mot de passe classe")
                                        return res.sendStatus(400)
                                    }
                                });
                            })
                    });
            })
    } else {
        return res.status(403).send("Accès interdit : tentative de changement de mail de classe !")
    }
}


module.exports = { ajoutInvitation, suppressionEleve, changementMailClasse, changementMdpClasse }