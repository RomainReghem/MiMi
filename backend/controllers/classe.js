const fs = require('fs');

const Classe = require('../models/users').Classe
const Eleve = require('../models/users').Eleve
const Score = require('../models/users').Score


/**
 * Renvoie l'adresse mail et le nom de tous les élèves qui appartenant à la classe donnée (mail)
 * 
 * @param {*} req la requête du client, contient mail dans les paramètres, qui correspond au mail de la classe
 * @param {*} res la réponse du serveur
 */
const getAllStudents = (req, res) => {
    //console.log("\n*** Récuperation des eleves ***")
    //console.log("Classe.js --> getAllStudents")
    const mail = req.query.mail
    // on cherche tous les élèves qui appartiennent à la classe dont l'email est donné
    // pour cela on ne prend que les élèves qui ont acceptés l'invitationt=
    // on veut spécifiquement l'attribut courriel, nom et prénom
    Eleve.findAll({
        attributes: ['courriel', 'nom', 'prenom'],
        where: { invitation: "acceptee" },
        // jointure avec la table classe
        include: [{
            model: Classe,
            attributes: [],
            where: {
                courriel: mail
            }
        }]
    }).then(eleves => {
        Eleve.findAll({
            attributes: ['courriel'],
            where: { invitation: "en attente" },
            // jointure avec la table classe
            include: [{
                model: Classe,
                attributes: [],
                where: {
                    courriel: mail
                }
            }]
        }).then(elevesInvites => {
            return res.json({ eleves: eleves, elevesInvites:elevesInvites })
        }).catch(err => {
            console.log("Err controllers/classe.js > getAllStudents :  erreur eleve findall " + err)
            return res.status(520).send("Erreur lors de la récupèration des informations des élèves invités.")
        });
    }).catch(err => {
        console.log("Err controllers/classe.js > getAllStudents :  erreur eleve findall " + err)
        return res.status(520).send("Erreur lors de la récupèration des informations des élèves.")
    });
}


/**
 * Supprime une classe et toutes ses invitations envoyées aux élèves
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const deleteClasse = (req, res) => {
    //console.log("\n*** Suppression de la classe ***")
    //console.log("Classe.js --> deleteClasse")
    const mail = req.body.mail

    // on récupère les infos de la bd sur la classe à partir du mail donné
    Classe.findOne({
        attributes: ['idclasse'],
        where: { courriel: mail }
    })
        .then(classe => {
            if (!classe) {
                console.log("Err controllers/classe.js > deleteClasse : pas de classe trouvée à supprimer")
                return res.status(404).send("Pas de classe trouvée à supprimer")
            }
            const num = classe.idclasse;
            // on va changer toutes les invitations des élèves de la classe
            // on cherche tous les élèves qui appartiennent à la classe dont l'id est donné
            // on fait cela pour éviter les contraintes de clé étrangère, et qu'un élève peut exister sans classe
            Eleve.update({ idclasse: '', invitation: "aucune" }, { where: { idclasse: num } })
                .then(() => {
                    // on supprime maintenant les scores pour respecter les contraintes de clé étrangère
                    Score.destroy({
                        where: {
                            idclasse: num
                        }
                    })
                        .then(() => {
                            // console.log("Suppression des infos sur la classe effectué.")
                            // Delete
                            Classe.destroy({
                                where: {
                                    idclasse: num
                                }
                            }).then(() => {
                                // console.log("ok")
                                // maintenant on doit supprimer les dossiers et les documents de la classe
                                const path = "./Documents/" + mail
                                // supprime le dossier du chemin donné, ainsi que tout ce qui se trouve à l'intérieur
                                fs.rmdir(path, { recursive: true }, (err) => {
                                    if (err) {
                                        console.log("Err controllers/classe.js > deleteClasse : erreur suppression dossiers : " + err)
                                        return res.status(500).send("Erreur lors de la suppression de documents.")
                                    }
                                    // console.log("Suppression effectuée !")
                                    return res.status(201).send("Suppression effectuée")
                                });
                            }).catch(err => {
                                console.log("Err controllers/classe.js > deleteClasse : classe destroy " + err)
                                return res.status(500).send("Erreur survenue lors de la suppression de la classe.")
                            })
                        })
                        .catch(err => {
                            console.log("Err controllers/classe.js > deleteClasse : score destroy" + err)
                            return res.status(500).send("Erreur survenue lors de la suppression du score.")
                        })
                })
                .catch(err => {
                    console.log("Err controllers/classe.js > deleteClasse : eleve update " + err)
                    return res.status(520).send("Erreur lors du retrait des invitations des élèves")
                });
        }).catch(err => {
            console.log("Err controllers/classe.js > deleteClasse : classe findone " + err)
            return res.status(520).send("Serveur injoignable.")
        })
}


module.exports = {
    getAllStudents,
    deleteClasse
}
