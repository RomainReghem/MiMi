const Modification = require('../controllers/modification.js')

/**
 * Change la valeur d'invitation à en attente et l'id de classe à l'id de la classe dont on reçoit le mail
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ajoutInvitation = (req, res) => {
    console.log("\n*** Ajout de l'invitation de la classe ***")
    const email = req.body.eleve;
    const emailClasse = req.body.classe;
    Modification.setInvitation("en attente", email, emailClasse, function (code) {
        console.log("code ajout " + code)
        if (code == 201) {
            return res.status(201).send("Ajout de l'invitation de la classe réussie !")
        }
        return res.status(code).send("Erreur")
    })

}

/**
 * Change la valeur d'invitation à "aucune" et l'id de classe à rien
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const suppressionEleve = (req, res) => {
    console.log("\n*** Suppression de l'élève de la classe ***")
    const email = req.body.eleve;
    Modification.setInvitation("aucune", email, "", function (code) {
        if (code == 201) {
            return res.status(201).send("Suppression de l'élève réussi !")
        }
        return res.status(code).send("Erreur")
    })
}

module.exports = { ajoutInvitation, suppressionEleve }