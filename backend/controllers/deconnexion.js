let refreshTokens = require('./connexion').refreshTokens;

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
    // retire de la liste des refresh token le refresh token
    refreshTokens = await  refreshTokens.filter(
        (c) => c != refreshToken
    );
    console.log("Déconnexion effectuée !")
    // On vide le cache des cookies
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

module.exports = Deconnexion