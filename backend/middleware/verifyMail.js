const { Eleve, Classe } = require("../models/users");


/**
 * Vérifie le mail et le role, afin de determiner si l'utilisateur actuel a le droit d'accèder aux fichiers
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 * @param {*} next ce qui suit
 * @returns une erreur, s'il y en a 
 */
const verifyAccesGet = (req, res, next) => {
    // le mail de la personne a qui on veut acceder
    const mailDossier = req.query.findMail;
    // le mail de la personne qui est censée demander les accès
    const mail = req.query.mail;
    // le mail enregistré dans le cookie de la session, est censé être équivalent au mail donné
    const mailToken = req.mail;
    // le role enregistré dans le cookie de la session
    const roleToken = req.role;

    // On doit d'abord vérifier que l'adresse mail qu'on nous donne est correcte syntaxiquement
    if (mail == undefined || mailDossier == undefined) {
        console.log("récupération impossible sans mail!")
        return res.status(400).send("Aucune adresse email reçue !");
    }

    if (!(mail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= mail.length || !(mailDossier.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= mailDossier.length) {
        console.log("forme mail incorrect")
        return res.status(400).send("L'adresse mail %s n'est pas de la bonne forme ! ", mail)
    }

    // ON STOCKE EN PREMIER LES ROLES
    determiningRole(mail, function (err, roleDetermined) {
        if (err) {
            return res.status(520).send(err);
        }
        req.roleFound = roleDetermined;
        // verification pour les roles
        if (roleToken != roleDetermined) {
            return res.status(403).send("Le role de l'utilisateur ne correspond au role inscrit dans ses cookies !");
        }
        // on regarde si les deux mails donnés par le client sont équivalent
        if (mailDossier == mail) {
            if (mailToken == mail) {
                console.log('pas de problème d\'accès')
                next()
            } else {
                console.log('Mail trouvé dans le token incorrect : %s et non %s', mailToken, mail)
                return res.status(403).send("Le mail %s de l'utilisateur n'est pas %s", mailToken, mail)
            }
            // sinon ça doit être une classe qui essaie d'accèder à un compte élève ou inversement
        } else {
            determiningRole(mailDossier, function (err, roleDossier) {
                if (err) {
                    return res.status(520).send(err);
                }
                // quand c'est un eleve
                if (roleDetermined == "eleve") {
                    // on verifie qu'il essaie d'accèder au dossier d'une classe
                    if (roleDossier != "classe") {
                        // ce n'est pas une classe
                        return res.status(403).send("Tentative d'accès aux fichiers d'un autre élève");
                    }
                    Eleve.findOne({ attributes: ['idclasse'], where: { courriel: mail, invitation: "acceptee" } })
                        .then(eleve => {
                            if (!eleve) {
                                return res.status(404).send("Aucune classe pour cet élève %s.", mail)
                            }
                            Classe.findOne({ attributes: ['courriel'], where: { idclasse: eleve.idclasse } })
                                .then(classe => {
                                    if (!classe) {
                                        return res.status(404).send("La classe de l'élève n'existe pas.")
                                    }
                                    if (classe.courriel != mailDossier) {
                                        return res.status(403).send("Tentative d'accès aux fichiers d'une autre classe");
                                    }
                                    // console.log("tout est bon, la classe appartient à l'élève qui essaie d'y accèder")
                                    next();
                                })
                                .catch(err => {
                                    return res.status(520).send("Erreur lors de la vérification du compte classe.")
                                })
                        })
                        .catch(err => {
                            return res.status(520).send("Erreur lors de la vérification du compte élève.")
                        })
                } else {
                    // on verifie qu'on essaie d'accèder au dossier d'un élève
                    if (roleDossier != "eleve") {
                        // ce n'est pas une classe
                        return res.status(403).send("Tentative d'accès aux fichiers d'une autre classe");
                    }
                    Classe.findOne({ attributes: ['idclasse'], where: { courriel: mail } })
                        .then(classe => {
                            if (!classe) {
                                return res.status(404).send("Aucune classe trouvée pour ce mail %s.", mail)
                            }
                            Eleve.findOne({ attributes: ['ideleve'], where: { idclasse: classe.idclasse, invitation: "acceptee", courriel: mailDossier } })
                                .then(eleve => {
                                    if (!eleve) {
                                        return res.status(403).send("Tentative d'accès aux fichiers d'un élève pas dans la classe.")
                                    }
                                    // console.log("tout est bon, l'élève appartient à la classe qui essaie d'y accèder")
                                    next();
                                })
                                .catch(err => {
                                    return res.status(520).send("Erreur lors de la vérification du compte élève.")
                                })
                        })
                        .catch(err => {
                            return res.status(520).send("Erreur lors de la vérification du compte classe.")
                        })
                }
            })
        }
    })
}


/**
 * Fonction middleware qui permet de vérifier si l'utilisateur peut sauvegarder/modifier/supprimer
 * @param {*} req la requête du client, contient notamment le mail de l'utilisateur sur lequel on veut faire le changement de document
 * @param {*} res la réponse du serveur
 * @param {*} next la fonction qui suit
 * @returns la réponse du serveur en cass d'erreur
 */
const verifyAccessSave = (req, res, next) => {
    console.log("\n*** Vérification des droits d'accès au document ***")
    // le mail de la personne qui est censée demander les accès
    const mail = req.body.mail;
    // le mail enregistré dans le cookie de la session, est censé être équivalent au mail donné
    const mailToken = req.mail;
    // le role enregistré dans le cookie de la session
    const roleToken = req.role;

    // On doit d'abord vérifier que l'adresse mail qu'on nous donne est correcte syntaxiquement
    if (mail == undefined) {
        console.log("pas de mail!")
        return res.status(400).send("Aucune adresse email reçue !");
    }

    if (!(mail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= mail.length) {
        console.log("forme mail incorrect")
        return res.status(400).send("L'adresse mail %s n'est pas de la bonne forme ! ", mail)
    }
    console.log(mail)
    // On veut le role de l'eleve qui veut sauvegarder
    determiningRole(mail, function (err, roleDetermined) {
        if (err) {
            return res.status(520).send(err);
        }
        req.roleFound = roleDetermined;
        // verification pour les roles
        if (roleToken != roleDetermined) {
            return res.status(403).send("Le role de l'utilisateur ne correspond pas au role inscrit dans ses cookies !");
        }
        // on regarde si les deux mails donnés par le client sont équivalent
        if (mailToken == mail) {
            // console.log('pas de problème d\'accès')
            next()
        } else {
            console.log('Mail trouvé dans le token incorrect : %s et non %s', mailToken, mail)
            return res.status(403).send("Le mail %s de l'utilisateur n'est pas %s", mailToken, mail)
        }
    })
}

 
/**
 * fonction qui aide à déterminer le role (eleve ou classe) d'un utilisateur en fonction de son adresse mail
 * @param {*} email le mail de l'utilisateur dont on veut connaître le rôle.
 * @param {*} callback la fonction qui peut contenir deux variables, une variable d'erreur ou le role
 */
function determiningRole(email, callback) {
    // On va regarder si c'est un compte d'élève
    Eleve.findOne({
        attributes: ["ideleve"], where: { courriel: email }
    })
        .then(eleve => {
            if (eleve) {
                //console.log("Félicitation ! C'est un élève !")
                return callback(null, "eleve");
            }
            // si ce n'est pas un élève,c'est probablement une classe
            Classe.findOne({
                attributes: ["idclasse"],
                where: { courriel: email }
            })
                .then(classe => {
                    // pas de classe, pas de chocolat !
                    if (!classe) {
                        console.log("Aucun utilisateur avec l'adresse mail %s trouvée :( ", email);
                        return callback(new Error("Aucun utilisateur trouvé ayant cette adresse : %s", email))
                    }
                    //console.log("Oh... C'est une classe...")
                    return callback(null, "classe")
                })
        })
        .catch(err => {
            console.log("Erreur lors de verif si eleve : " + err)
            return callback(new Error("Problème lors de la vérification d'identité de compte"));
        })
}


module.exports = {
    verifyAccesGet,
    determiningRole,
    verifyAccessSave
}