const { Eleve, Classe } = require('../models/users');

const jwt = require("jsonwebtoken")

require("dotenv").config();


/**
 * Permet de déconnecter un utilisateur en supprimant ses tokens.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const Deconnexion = async (req, res) => {
    console.log("\n*** Déconnexion ***")
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        console.log("pas de cookies")
        // Ne retourne pas d'erreur, il n'y avait pas de cookies
        return res.status(204).send("Déconnexion sans cookies");
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded == undefined) {
                console.log("probleme lors de la verification " + err);
                // accès interdit
                return res.status(204).send("Déconnexion : aucune informations trouvées.");
            } else {
                const role = decoded.role
                const mail = decoded.mail
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                if (role == "eleve") {
                    console.log("token eleve " + mail)
                    Eleve.update({ token: "" }, { where: { courriel: mail } })
                        .then(() => {
                            console.log("Déconnexion de l'élève effectuée ! ")
                            return res.status(204).send("Déconnexion de l'élève.");
                        })
                        .catch(err => {
                            console.log("erreur lors de la deconnexion " + err)
                            return res.status(204).send("Erreur survenue lors de la déconnexion !")
                        })
                } else if (role == "classe") {
                    console.log("token classe")
                    Classe.update({ token: "" }, { where: { courriel: mail } })
                        .then(() => {
                            console.log("Déconnexion de la classe effectuée ! ")
                            return res.status(204).send("Déconnexion de la classe.");
                        })
                        .catch(err => {
                            console.log("erreur lors de la deconnexion : " + err)
                            return res.status(204).send("Erreur du serveur survenue lors de la suppression des cookies.")
                        })
                } else {
                    console.log("what is this role? " + role)
                    return res.status(204).send("Role inexistant : accès interdit")
                }
            }
        }
    )
}


module.exports = Deconnexion