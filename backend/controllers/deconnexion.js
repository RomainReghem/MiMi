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
        return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded == undefined) {
                console.log("probleme lors de la verification " + err);
                // accès interdit
                return res.sendStatus(403);
            } else {
                const role = decoded.role
                const mail = decoded.mail
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                if (role == "eleve") {
                    console.log("token eleve " + mail)
                    Eleve.update({ token: "" }, { where: { courriel: mail } })
                        .then(() => {
                            console.log("Déconnexion de l'élève effectuée ! ")
                            return res.sendStatus(204);
                        })
                        .catch(err => {
                            console.log("erreur lors de la deconnexion " + err)
                            return res.send("Erreur survenue lors de la déconnexion !").status(520)
                        })
                } else if (role == "classe") {
                    console.log("token classe")
                    Classe.update({ token: "" }, { where: { courriel: mail } })
                        .then(() => {
                            console.log("Déconnexion de l'élève effectuée ! ")
                            return res.sendStatus(204);
                        })
                        .catch(err => {
                            console.log("erreur lors de la deconnexion : " + err)
                            return res.send(err).status(520)
                        })
                } else {
                    console.log("what is this role? " + role)
                    return res.send("Role inexistant : accès interdit").status(403)
                }
            }
        }
    )
}

module.exports = Deconnexion