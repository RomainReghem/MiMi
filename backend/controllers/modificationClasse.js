const Modification = require('../controllers/modification.js')

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = require('./connexion').refreshTokens;

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
        Classe.findOne({ where: { courriel: email } })
            .then(classe => {
                // s'il n'y aucune classe  qui a été trouvée alors aucun compte ne correspond à ce mail
                if (!classe) {
                    return res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // On vérifie que dans la table classe aucune classe ne possède déjà la nouvelle adresse mail
                Classe.findOne({ attributes:['idclasse'],where: { courriel: newEmail } })
                    .then(classe2 => {
                        if (classe2) {
                            console.log("Mail existant pour la classe");
                            return res.status(409).send('Adresse déjà utilisée par un compte classe')
                        }
                        // on vérifie que l'adresse mail n'est aussi pas déjà prise par un élève
                        Eleve.findOne({attributes:['ideleve'], where: { courriel: newEmail } })
                            .then(async eleve => {
                                // si on trouve un eleve, c'est qu'il est enregistré avec le nouveau mail
                                if (eleve) {
                                    console.log("Mail existant pour un eleve");
                                    // res.sendStatus(411)
                                    return res.status(411).send('Adresse déjà utilisée par un élève')
                                }
                                // comparaion du mdp avec celui connu
                                bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                    if (estValide) {
                                        console.log("Bon mot de passe de la classe")
                                        // on change le mail
                                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                        Classe.update(
                                            { courriel: newEmail },
                                            { where: { idclasse: classe.idclasse } }
                                        ).then(async newclasse => {
                                            if (newclasse) {
                                                console.log("update ok : " + newclasse.idclasse + newclasse.courriel)
                                                // console.log("\n*** Recréation des tokens ***")
                                                const cookies = req.cookies;
                                                //console.log("refresh cookies" + cookies.jwt);
                                                if (!cookies?.jwt) {
                                                    console.log("accès refusé")
                                                    // 401 : authentification raté
                                                    return res.status(401).send("Accès refusé : authentification requise")
                                                }
                                                const refreshTokenOld = cookies.jwt;
                                                if (!refreshTokens.includes(refreshTokenOld)) {
                                                    //token invalide 
                                                    return res.status(403).send("Accès interdit : autorisation nécessaire")
                                                }
                                                jwt.verify(
                                                    refreshTokenOld,
                                                    process.env.REFRESH_TOKEN_SECRET,
                                                    (err, decoded) => {
                                                        if (err) {
                                                            //refreshTokens = refreshTokens.filter((c) => c != refreshToken)
                                                            console.log(err);
                                                            // accès interdit
                                                            res.sendStatus(403);
                                                        } else {
                                                            if (decoded.mail == email) {
                                                                // on retire l'ancien refreshtoken de la liste
                                                                refreshTokens = refreshTokens.filter((c) => c != refreshTokenOld)
                                                                // on crée de nouveaux token 
                                                                console.log("** Recréation des cookies pour la classe **")
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
                                                                refreshTokens.push(refreshToken);
                                                                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                                res.json({ accessToken: accessToken })
                                                            } else {
                                                                return res.sendStatus(403)
                                                            }
                                                        }
                                                    })
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


module.exports = { ajoutInvitation, suppressionEleve }