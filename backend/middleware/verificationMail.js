/**
 * Vérifie le mail contenu dans la requête, s'il n'est pas bon, renvoie une erreur
 * @param {*} req la requête du client, contient le mail dans son body
 * @param {*} res la réponse du serveur à retourner en cas d'erreur
 * @param {*} next pour passer à la fonction suivante
 * @returns la réponse en cas d'erreur
 */
const verifyMailBody = (req, res, next) => {
    const email = req.body.mail;

    if (email == null) {
        console.log("Err middleware/verificationMail.js > verifyMailBody : pas de mail :(")
        return res.status(404).send("Aucun mail trouvé.")
    } else if (100 <= email.length || !(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"))) {
        console.log("Err middleware/verificationMail.js > verifyMailBody : forme mail incorrect")
        return res.status(400).send("La forme du mail %s est incorrecte.", email)
    } else {
        next()
    }
}


/**
 * Vérifie le mail contenu dans la requête, s'il n'est pas bon, renvoie une erreur
 * @param {*} req la requête du client, contient le mail dans le query
 * @param {*} res la réponse du serveur à retourner en cas d'erreur
 * @param {*} next pour passer à la fonction suivante
 * @returns la réponse en cas d'erreur
 */
const verifyMailQuery = (req, res, next) => {
    const email = req.query.mail;

    if (email == null) {
        console.log("Err middleware/verificationMail.js > verifyMailQuery : aucun mail contenu dans le query")
        return res.status(404).send("Aucun mail trouvé.")
    } else if (100 <= email.length || !(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"))) {
        console.log("Err middleware/verificationMail.js > verifyMailQuery : forme mail incorrect")
        return res.status(400).send("La forme du mail %s est incorrecte.", email)
    } else {
        //console.log("pas de soucis avec le mail :-)")
        next()
    }
}


module.exports = {
    verifyMailBody,
    verifyMailQuery
}