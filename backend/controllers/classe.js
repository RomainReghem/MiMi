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
        attributes: ['courriel'],
        where: {invitation:"acceptee"},
        // jointure avec la table eleve
        include: [{
            model: Classe,
            attributes: [],
            required: true,
            where: {
                courriel: mail
            }
        }]
    }).then(eleves => {
        for (e in eleves) {
            console.log('élève ' + e)
        }
        // res.json({students:eleves})
        res.json({ eleves: eleves })
    })
}

// pour supprimer une classe, il faut d'abord supprimer ses élèves, tout du moins mettre l'idclasse de la table eleve à null

module.exports = {
    getAllStudents
}
