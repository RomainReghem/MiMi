const Classe = require('../models/users').Classe
const Eleve = require('../models/users').Eleve

/**
 * Renvoie l'adresse mail de tous les élèves qui appartiennent à la classe données (mail)
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllStudents = (req, res) => {
    console.log("\n*** Récuperation des eleves ***")
    const mail = req.query.mail
    // on cherche tous les élèves qui appartiennent à la classe dont l'email est donné
    // on veut spécifiquement l'attribut courriel
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
        res.json({ eleves: eleves })
    })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        });
}

/**
 * Supprime une classe et toutes ses invitations envoyées aux élèves
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const deleteClass = (req, res) => {
    console.log("\n*** Suppression de la classe ***")
    const mail = req.body.mail

    // on récupère les infos de la bd sur la classe à partir du mail donné
    Classe.findOne({
        attributes: ['idclasse'],
        where: { courriel: mail }
    })
        .then(classe => {
            if (!classe) {
                console.log("Pas de classe trouvé à supprimer")
                return res.status(404).send("Pas de classe trouvé à supprimer")
            }
            const num = classe.idclasse;
            // on va changer toutes les invitations des élèves de la classe
            // on cherche tous les élèves qui appartiennent à la classe dont l'id est donné
            Eleve.update({ idclass: null, invitation: "aucune" }, { where: { idclasse: num } })
                .then(() => {
                    // on supprime maintenant les scores pour respecter les contraintes de clé étrangère
                    Score.destroy({
                        where: {
                            idclasse: num
                        }
                    })
                        .then(() => {
                            console.log("Suppression des infos sur la classe effectué.")
                            // Delete
                            Classe.destroy({
                                where: {
                                    idclasse: num
                                }
                            }).then(result => {
                                if (!result) {
                                    console.log("erreur non déf")
                                    return res.status(520);
                                }
                                // maintenant on doit supprimer les dossiers et les documents de la classe
                                const path = "./Classes/eleve" + num
                                // supprime le dossier du chemin donné, ainsi que tout ce qui se trouve à l'intérieur
                                fs.rmdir(path, { recursive: true }, (err) => {
                                    if (err) {
                                        console.log("erreur suppression dossiers : " + err)
                                        return res.status(500).send("Erreur lors de la suppression de documents.")
                                    }
                                    console.log("Suppression effectuée !")
                                    return res.send("Suppression effectuée").status(201)
                                });
                            }).catch(err => {
                                console.log(err)
                                return res.status(500).send("Erreur survenue lors de la suppression de la classe.")
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).send("Erreur survenue lors de la suppression du score.")
                        })
                })
                .catch(err => {
                    console.log(err)
                    return res.send(err).status(520)
                });
        }).catch(err => {
            console.log(err)
            return res.status(404).send("Serveur injoignable.")
        })
}


module.exports = {
    getAllStudents,
    deleteClass
}
