const connexion = require('./connexion')
let refreshTokens = connexion.refreshTokens;
const jwt = require('jsonwebtoken');
const { getInvitation } = require('./eleve');

require('dotenv').config()

/**
 * Si l'authentification et l'authorisation sont correctes, remets à jour le token d'accès.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur
 */
const refreshToken = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        console.log("accès refusé")
        // 401 : authentification raté
        return res.status(401).send("accès refusé")
    }
    const refreshToken = cookies.jwt;
    if (!refreshTokens.includes(refreshToken)) {
        //token invalide 
        return res.status(403).send("accès interdit")
    }
    console.log('REFRESH ' + refreshToken)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded == undefined) {
                console.log(err);
                // accès interdit
                return res.sendStatus(403);
            } else {
                console.log("decoded " + decoded.mail + " : " + decoded.role)
                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "mail": decoded.mail,
                            "role": decoded.role
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '10m' });
                    getInvitation(decoded.mail, function (reponse) {
                        console.log('dans la fonciton')
                        if (reponse == 404 || reponse == 407) {
                            return res.sendStatus(reponse)
                        } else {
                            return res.status(201).json(Object.assign({role:decoded.role, accessToken:accessToken},reponse));
                        }
                    })
            }
        }
    )
}

module.exports = { refreshToken };
