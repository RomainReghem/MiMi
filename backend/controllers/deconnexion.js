const Refresh = require('../models/users').RefreshToken;

/**
 * Permet de déconnecter un utilisateur en supprimant ses tokens.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const Deconnexion = async(req, res) => {
    console.log("\n*** Déconnexion ***")
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        console.log("pas de cookies")
        // Ne retourne pas d'erreur, il n'y avait pas de cookies
        return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;
   
    // supprime de la db le refreshtoken 
    Refresh.destroy({where:{token:refreshToken}})
    .then(()=>{
        console.log("Déconnexion effectuée !")
        // On vide le cache des cookies
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.sendStatus(204);
    }).catch(err=>{
        console.log("erreur lors de la deconnexion")
        return res.send(err).status(520)
    })
  
}

module.exports = Deconnexion