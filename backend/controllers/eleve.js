const Eleve = require('../models/users').Eleve
const Score = require('../models/users').Score

// pour l'accès aux documents
const fs = require('fs');
const { Classe } = require('../models/users');

/**
 * Renvoie au client le pseudo de l'élève en fonction de son adresse mail.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur
 */
const getUsernameStudent = (req, res) => {
    console.log("\n*** Récupération du pseudo ***")
    const email = req.query.mail

    if (email == undefined) {
        return res.status(404).send("Pas de mail")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        return res.status(400).send("Mail incorrect")
    }

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peut récupèrer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['pseudo'],
            where: {
                courriel: email
            }
        }).then(eleve => {
            if (eleve) {
                console.log('pseudo ' + eleve.pseudo)
                return res.json({ pseudo: eleve.pseudo })
            } else {
                return res.status(409).send("Aucun élève avec cette adresse")
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
 * Renvoie au client le nom et prénom de l'élève en fonction de son adresse mail.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur
 */
 const getNameStudent = (req, res) => {
    console.log("\n*** Récupération du nom et du prénom de l'élève ***")
    const email = req.query.mail

    if (email == undefined) {
        return res.status(404).send("Pas de mail")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        return res.status(400).send("Mail incorrect")
    }

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peut récupèrer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['prenom', 'nom'],
            where: {
                courriel: email
            }
        }).then(eleve => {
            if (eleve) {
                console.log('prenom %s et nom %s ', eleve.prenom, eleve.nom)
                return res.json({ nom: eleve.nom, prenom:eleve.prenom })
            } else {
                return res.status(409).send("Aucun élève avec cette adresse")
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
 * Supprime l'élève en fonction de son mail.
 * Supprime aussi tous ses documents.
 * Supprime aussi ses scores aux jeux
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const deleteStudent = async (req, res) => {
    console.log('\n*** Suppression de compte élève ***')
    // on vérifie que le mail soit bien présent
    if (!req?.body?.mail) {
        console.log("Adresse mail manquante pour la suppression ")
        return res.status(400).send('Email manquant');
    }
    const email = req.body.mail
    // vérification du mail
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(407).send("Mail incorrect")
    }

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peuvent se supprimer
    if (role == "eleve" && emailToken == email) {
        // on cherche dans la bd l'eleve qui correspond au mail fourni
        Eleve.findOne({
            attributes: ['ideleve'],
            where: { courriel: email }
        })
            .then(eleve => {
                // si aucun élève n'a été trouvé
                if (!eleve) {
                    return res.status(401).send("Pas d'élève trouvé avec cet adresse mail.");
                }
                // sinon on supprime l'élève
                Eleve.destroy({
                    where: {
                        ideleve: eleve.ideleve
                    }
                }).then(() => {
                    // maintenant on doit supprimer les dossiers et les documents de l'élève
                    const num = eleve.ideleve;
                    const path = "./Eleves/eleve" + num
                    // supprime le dossier du chemin donné, ainsi que tout ce qui se trouve à l'intérieur
                    fs.rm(path, { recursive: true }, (err) => {
                        if (err) {
                            console.log("erreur suppression dossiers : " + err)
                            return res.status(500).send("Erreur lors de la suppression de documents.")
                        }
                        console.log("Suppression effectuée !")
                        return res.sendStatus(205);
                    })
                }).catch(err => {
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


/**
 * Retourne l'invitation et l'id de la classe associée à l'invitation dans un format JSON
 * 
 * @param {String} emailEleve l'email de l'èleve dont on veut l'invitation
 */
function getInvitation(emailEleve, cb) {
    console.log("\n***Récupération d'invitation.***")
    if (!(emailEleve.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailEleve.length) {
        console.log("forme mail incorrect")
        return cb(407)
    }

    Eleve.findOne({
        attributes: ['invitation', 'idclasse'],
        where: { courriel: emailEleve }
    })
        .then(eleve => {
            // si aucun élève n'a été trouvé
            if (!eleve) {
                return cb(404)
            }
            const invitation = eleve.invitation;
            if (invitation != "aucune") {
                Classe.findOne({ attributes: ["idclasse"], where: { idclasse: eleve.idclasse } })
                    .then(classe => {
                        if (!classe) {
                            return cb(404);
                        }
                        return cb({ invitation: invitation, idclasse: classe.idclasse })
                    })
                    .catch(err => {
                        console.log(err)
                        return cb({ erreur: err })
                    });
            } else {
                return cb({ invitation: invitation })
            }
        })
        .catch(err => {
            console.log(err)
            return cb({ erreur: err })
        });
}

module.exports = {
    getUsernameStudent,
    deleteStudent,
    getInvitation
}
