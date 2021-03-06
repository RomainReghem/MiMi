const Modification = require('./modificationInvitation.js')

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/**
 * Change la valeur d'invitation à en attente et l'id de classe à l'id de la classe dont on reçoit le mail
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ajoutInvitation = (req, res) => {
    //console.log("\n*** Ajout de l'invitation de la classe ***")
    const email = req.body.eleve;
    const emailClasse = req.body.classe;

    const role = req.role;
    const emailToken = req.mail
    // seul une classe peut ajouter un eleve à la classe
    if (role == "classe" && emailToken == emailClasse) {
        Modification.setInvitation("en attente", email, emailClasse, function (code) {
            //console.log("code ajout " + code)
            if (code == 201) {
                return res.status(201).send("Ajout de l'invitation de la classe réussie !")
            }
            return res.status(code).send("Erreur lors de l'ajout de l'invitation !")
        })
    } else {
        console.log("Err controllers/modificationClasse.js > ajoutInvitation : role %s inconnu ", role)
        return res.status(403).send("Accès interdit: tentative d'acceptation de l'invitation par un autre")
    }
}


/**
 * Change la valeur d'invitation à "aucune" et l'id de classe à rien.
 * Peut être appelé quand une classe veut supprimer un élève de sa classe 
 * ou quand un élève refuse une invitation.
 * Fait appel à la fonction "setInvitation".
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const suppressionEleve = (req, res) => {
    // console.log("\n*** Suppression de l'élève de la classe ***")

    const emailClasse = req.body.classe
    const role = req.role;
    const emailToken = req.mail
    // seul une classe peut supprimer un eleve de la classe
    if (role == "classe" && emailClasse == emailToken) {
        const email = req.body.eleve;
        Modification.setInvitation("aucune", email, "", function (code) {
            if (code == 201) {
                return res.status(201).send("Suppression de l'élève de la classe réussi !")
            }
            return res.status(code).send("Erreur lors de la suppression de l'élève de la classe.")
        })
    } else {
        console.log("Err controllers/modificationClasse.js > suppressionEleve : role %s incorrect ", role)
        return res.status(403).send("Accès interdit")
    }
}


/**
 * Change dans la bd le mot de passe de la classe.
 * @param {*} req la requête du client, contient le mail, l'ancien mot de passe et le nouveau mot de passe de la classe
 * @param {*} res la réponse du serveur
 * @returns la réponse 
 */
const changementMdpClasse = (req, res) => {
    //console.log("\n***Changement mot de passe classe***")
    let email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;

    //console.log("mail " + email + " mdp " + mdp + " newMdp " + newMdp)
    //console.log("** Vérification des données **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("Err controllers/modificationClasse.js > changementMdpClasse : taille mdp pas ok")
        return res.status(400).send("Le mot de passe actuel n'est pas de la bonne forme ! ")
    }
    if (!(newMdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("Err controllers/modificationClasse.js > changementMdpClasse : taille new mdp pas ok")
        return res.status(400).send("Le nouveau mot de passe n'est pas de la bonne forme !")
    }

    const role = req.role;
    const emailToken = req.mail
    // seul une classe peut changer son propre mot de passe
    if (role == "classe" && email == emailToken) {
        Classe.findOne({ attributes: ['idclasse', 'motdepasse'], where: { courriel: email } })
            .then(classe => {
                if (!classe) {
                    console.log("Err controllers/modificationClasse.js > changementMdpClasse : aucune classe trouvée avec le mail " + email)
                    return res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // si les mots de passe sont les mêmes
                if (mdp == newMdp) {
                    // console.log("Mot de passe inchangé !")
                    return res.status(204).send("Mot de passe inchangé !")
                }
                // comparaion du mdp avec celui connu
                bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                    if (err) {
                        console.log("Err controllers/modificationClasse.js > changementMdpClasse : bcrypt compare " + err)
                        return res.status(520).send("Erreur lors de la vérification du mot de passe.")
                    }
                    if (estValide) {
                        // console.log("Bon mot de passe de la classe")
                        // on change le mdp
                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                        changePasswordClass(email, mdp, function (err, msg) {
                            if (err) {
                                return res.status(520).send(err)
                            }
                            return res.status(201).send(msg)
                        })
                    }
                    // si le mot de passe
                    console.log("Err controllers/modificationClasse.js > changementMdpClasse : mauvais mot de passe classe")
                    return res.status(400).send("Le mot de passe est éronné !");
                });
            })
            .catch(err => {
                console.log("Err controllers/modificationClasse.js > changementMdpClasse : classe findone " + err)
                return res.status(520).send("Erreur lors de la vérification de la validité du compte.")
            });
    } else {
        console.log('Err controllers/modificationClasse.js > changementMdpClasse : role %s ou mail %s du token invalide ', role, emailToken)
        return res.status(403).send("Accès interdit : tentative de changement de mot de passe de classe !")
    }
}

/**
 * Fonction qui change dans la base de données le mot de passe d'une classe spécifiée par son adresse mail
 * @param {String} email l'email de la classe dont on va changer le mot de passe
 * @param {String} mdp le nouveau mot de passe de la classe
 * @param {*} cb la fonction callback
 */
function changePasswordClass(email, mdp, cb) {
    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            //erreur lors du hashage
            console.log("Err controllers/changePasswordClass.js > changementMdpClasse : bcrypt.hash " + err);
            return cb("Erreur lors du hashage du mot de passe.")
        }
        Classe.update(
            { motdepasse: hash },
            { where: { courriel: email } }
        ).then(() => {
            // on envoie la classe avec le mdp modifié 
            return cb(null, "Mot de passe changé avec succès !");
        }).catch(err => {
            console.log(`Err controllers/changePasswordClass.js > changementMdpClasse : update classe : ${err}`)
            return cb("Erreur lors de la modification du mot de passe ")
        });
    });
}


/**
 * Change dans la base de données l'adresse mail de la classe, et les tokens associés
 * @param {*} req la requête du client, contient l'ancien et le nouveau mail de la classe, ainsi que le mot de passe de la classe
 * @param {*} res la réponse du serveur
 */
const changementMailClasse = (req, res) => {
    //console.log("\n***Changement mail classe***")
    let email = req.body.mail;
    const newEmail = req.body.newMail;
    const mdp = req.body.pwd;
    //console.log("email " + email + " new " + newEmail + " mdp " + mdp)

    //console.log("** Vérification mdp et mails **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("Err controllers/modificationClasse.js > changementMailClasse : taille mdp pas ok")
        return res.status(400).send("Le mot de passe n'est pas de la bonne forme ! ")
    }
    if (!(newEmail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= newEmail.length) {
        console.log("Err controllers/modificationClasse.js > changementMailClasse : forme mail incorrect")
        return res.status(400).send("L'adresse mail fournie n'est pas de la bonne forme !")
    }
    if (newEmail == email) {
        // console.log("mails identiques")
        return res.status(204).send("Mail identiques : pas de changement")
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
                    console.log("Err controllers/modificationClasse.js > changementMailClasse : aucune classe trouvée avec le mail " + email)
                    return res.status(404).send("Aucun compte correspondant à cet adresse.")
                }
                // On vérifie que dans la table classe aucune classe ne possède déjà la nouvelle adresse mail
                Classe.findOne({ attributes: ['idclasse'], where: { courriel: newEmail } })
                    .then(classe2 => {
                        if (classe2) {
                            console.log("Err controllers/modificationClasse.js > changementMailClasse : mail existant pour la classe");
                            return res.status(409).send('Adresse déjà utilisée par un compte classe')
                        }
                        // on vérifie que l'adresse mail n'est aussi pas déjà prise par un élève
                        Eleve.findOne({ attributes: ['ideleve'], where: { courriel: newEmail } })
                            .then(eleve => {
                                // si on trouve un eleve, c'est qu'il est enregistré avec le nouveau mail
                                if (eleve) {
                                    console.log("Err controllers/modificationClasse.js > changementMailClasse : mail existant pour un eleve");
                                    return res.status(411).send('Adresse déjà utilisée par un élève')
                                }
                                // comparaion du mdp avec celui connu
                                bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                    if (estValide) {
                                        // console.log("Bon mot de passe de la classe")
                                        // console.log("\n*** Recréation des tokens ***")
                                        const cookies = req.cookies;
                                        //console.log("refresh cookies" + cookies.jwt);
                                        if (!cookies?.jwt) {
                                            console.log("Err controllers/modificationClasse.js > changementMailClasse : accès refusé")
                                            // 401 : authentification raté
                                            return res.status(401).send("Accès refusé : authentification requise")
                                        }
                                        // console.log("** Recréation des cookies pour la classe **")

                                        const accessToken = jwt.sign(
                                            { "UserInfo": { "mail": newEmail, "role": "classe" } },
                                            process.env.ACCESS_TOKEN_SECRET,
                                            { expiresIn: '20m' }
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
                                        ).then(() => {
                                            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                            return res.status(201).json({ role: "classe", accessToken: accessToken, idclasse: classe.idclasse })
                                        }).catch(err => {
                                            console.log("Err controllers/modificationClasse.js > changementMailClasse : classe update " + err)
                                            return res.status(500).send("Erreur lors de l'actualisation des données du compte classe, la sauvegarde des données est compromise.");
                                        });

                                    } else {
                                        console.log("Err controllers/modificationClasse.js > changementMailClasse : Mauvais mot de passe classe")
                                        return res.status(400).send("Ce n'est pas le bon mot de passe !")
                                    }
                                });
                            })
                    });
            })
    } else {
        console.log('Err controllers/modificationClasse.js > changementMailClasse : role %s ou mail %s du token invalide ', role, emailToken)
        return res.status(403).send("Accès interdit : tentative de changement de mail de classe !")
    }
}


module.exports = { ajoutInvitation, suppressionEleve, changementMailClasse, changementMdpClasse, changePasswordClass }