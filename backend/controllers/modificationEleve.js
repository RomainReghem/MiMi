const Users = require('../models/users');
const Eleve = Users.Eleve;

const Modification = require('../controllers/modification.js')


/**
 * Change le pseudo de l'élève dans la base de données.
 * Utilise l'email, l'ancien pseudo et le mot de passe donnés par le client.
 * Vérifie la validité des informations et le fait que le pseudo soit unique.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementPseudo = (req, res) => {
    const email = req.body.mail;
    const pseudo = req.body.newPseudo;
    console.log("email " + email + " new " + pseudo)

    console.log("\n*** Vérification pseudo ***")
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    } else if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("forme pseudo incorrect")
        res.sendStatus(405)
    } else {
        Eleve.findOne({ where: { courriel: email } })
            .then(eleveToChange => {
                if (!eleveToChange) {
                    res.status(401).send("Eleve pas trouvé")
                } else {
                    // sinon on ne change rien
                    if (eleveToChange.pseudo != pseudo) {

                        Eleve.update(
                            {
                                pseudo: pseudo,
                            },
                            {
                                where: { ideleve: eleveToChange.ideleve },
                            }
                        ).then(newEleve => {
                            if (newEleve) {
                                //res.sendStatus(201)
                                return res.status(201).send("Modification de pseudo réussie.")
                            } else {
                                return res.status(520).send("non défini")
                            }

                        }).catch(err => {
                            console.log(err)
                            res.status(500).send("Erreur lors de la modification de pseudo.")
                        })

                    } else {
                        //res.send(eleveToChange);
                        res.status(201).send("Pas de modification de pseudo.")
                    }
                }


            })
    }
}

/**
 * Change la valeur d'invitation à aucune et l'id de classe à null
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const SuppressionClasse = (req, res) => {
    console.log("\n*** Suppression de classe d'un élève ***")
    const email = req.body.mail;
    const code = Modification.setInvitation("aucune", email, "")

    if (code == 201) {
        return res.status(201).send("Suppression de classe réussie !")
    }
    return res.status(code).send("Erreur")
}

/**
 * Change la valeur d'invitation à acceptee et l'id de classe à l'id de la classe dont on reçoit le mail
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const AcceptationInvitation = (req, res) => {
    console.log("\n*** Acceptation de l'invitation d'une classe ***")
    const email = req.body.mail;
    const emailClasse = req.body.mailClass;
    const code = Modification.setInvitation("acceptee", email, emailClasse)

    if (code == 201) {
        return res.status(201).send("Acceptation de la classe réussie !")
    }
    return res.status(code).send("Erreur")
}


/**
 * Change la classe de l'élève.
 * Utilise l'email fourni par le client pour retrouver la classe correspondante et l'ajouter à l'élève.
 * Vérifie la validité des informations.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementClasse = (req, res) => {
    console.log("\n*** Changement de classe ***")
    const emailEleve = req.body.mail;
    const emailClasse = req.body.mailClasse;
    if (!(emailEleve.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailEleve.length) {
        console.log("forme mail élève incorrect")
        // erreur 400
        return res.status(407).send("Le mail de l'élève n'est pas de la bonne forme.")
    }
    if (!(emailClasse.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailClasse.length) {
        console.log("forme mail classe incorrect")
        // erreur 400
        return res.status(407).send("Le mail fourni de la classe n'est pas de la bonne forme.")
    }

    Classe.findOne({
        where: { courriel: emailClasse }
    }).then(classe => {
        if (!classe) {
            console.log("Pas de classe trouvée !")
            return res.status(404).send("Aucune classe trouvée correspondant à ce mail : " + emailClasse)
        }
        Eleve.findOne({
            where: { courriel: emailEleve }
        }).then(eleve => {
            if (!eleve) {
                console.log("Pas d'élève trouvé !")
                return res.status(404).send("Aucun élève trouvé correspondant à ce mail : " + emailEleve)
            }
            console.log("Début modification ")
            if (eleve.idclasse == classe.idclasse) {
                console.log("classe déjà enregistrée")
                return res.status(204).send("Cet élève est déjà enregistré avec cet classe.")
            }
            Eleve.update(
                {
                    idclasse: classe.idclasse,
                },
                {
                    where: { ideleve: eleve.ideleve },
                }
            ).then(newEleve => {
                if (newEleve) {
                    //res.sendStatus(201)
                    console.log("Modification de la classe réussie")
                    res.status(201).send("Modification de classe réussie.")
                } else {
                    res.status(520).send("Aucun élève modifié.")
                }
            })
        })

    })
}


module.exports = { ChangementPseudo, SuppressionClasse, AcceptationInvitation }