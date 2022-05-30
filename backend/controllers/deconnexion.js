const { Eleve, Classe } = require('../models/users');

const Refresh = require('../models/users').RefreshToken;

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
                const role= decoded.role
                const mail=decoded.mail
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                if (role == "eleve") {
                    console.log("token eleve "+mail)
                    /*Eleve.findOne({attributes:['token'], where: { courriel: mail } })
                        .then(eleve => {
                            if (!eleve) {
                                console.log("Aucun eleve n'a ce token")
                                return res.send("Aucun eleve n'a ce token : accès interdit").status(401)
                            }
                            console.log("eleve token "+eleve.token)
                            if (eleve.token != refreshToken) {
                                console.log("Le token donné ne correspond pas à l'utilisateur")
                                return res.send("Le token donné ne correspond pas à l'utilisateur : accès interdit").status(403)
                            }*/
                            Eleve.update({ token: "" }, { where: { courriel: mail } })
                            .then(()=>{
                                console.log("Déconnexion de l'élève effectuée ! ")
                                res.sendStatus(204);
                            })
                            .catch(err => {
                                console.log("erreur lors de la deconnexion "+err)
                                return res.send(err).status(520)
                            })
                       /* }).catch(err => {
                            console.log("erreur lors de la recup de eleve " + err)
                            return res.send(err).status(520)
                        });*/
                } else if (role == "classe") {
                    console.log("token classe")
                    Classe.update({ token: "" }, { where: { courriel: mail } })
                    .then(()=>{
                        console.log("Déconnexion de l'élève effectuée ! ")
                        
                        res.sendStatus(204);
                    })
                    .catch(err => {
                        console.log("erreur lors de la deconnexion : "+err)
                        return res.send(err).status(520)
                    })
                } else {
                    console.log("what is this role? "+role)
                    return res.send("Role inexistant : accès interdit").status(403)
                }
            }
        }
    )

   /* const role = req.role;
    const mail = req.mail;
    if(role !=null && mail!=null){
        if (req.role == 'eleve') {
            Eleve.update({ token: null }, { where: { courriel: req.mail } })
            .then(()=>{
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                res.sendStatus(204);
            })
            .catch(err => {
                console.log("erreur lors de la deconnexion")
                return res.send(err).status(520)
            })
        } else {
            Classe.update({ token: null }, { where: { courriel: req.mail } })
            .then(()=>{
                res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
                res.sendStatus(204);
            })
            .catch(err => {
                console.log("erreur lors de la deconnexion")
                return res.send(err).status(520)
            })
        }
    }
    return res.status(200).send("cookies vide")*/
 
    // supprime de la db le refreshtoken 
/*    Refresh.destroy({ where: { token: refreshToken } })
        .then(() => {
            console.log("Déconnexion effectuée !")
            // On vide le cache des cookies
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            res.sendStatus(204);
        }).catch(err => {
            console.log("erreur lors de la deconnexion")
            return res.send(err).status(520)
        })*/

}

module.exports = Deconnexion