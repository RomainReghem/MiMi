const jwt = require("jsonwebtoken")

require("dotenv").config();

/**
 * Vérifie la validité du token, s'il est valide, enregistre dans la requete le mail et le role (eleve ou classe) de l'utilisateur
 * @param {*} req la requête
 * @param {*} res la réponse
 * @param {*} next ce qui suit
 * @returns une erreur, s'il y en a 
 */
const verifyJWT = (req, res, next) => {
    // console.log("\n*** Vérification du token (accessToken) ***")
    /* console.log(req.accessToken+" cookie "+req.cookie+" autre tesr"+req.header.auth)*/
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // si l'utilisateur n'est pas autorisé
    if (!authHeader) {
        console.log("Err middleware/verificationJWT.js > verifyJWT : pas de header")
        return res.statut(401).send("aucun en-tête spécifié")
    }
    //console.log("authHeader : " + authHeader)
    // le token est en deuxième position
    const token = authHeader.split(' ')[1]
    //console.log("token : "+token)
    // vérification du token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                console.log("Err middleware/verificationJWT.js > verifyJWT : token pas bon : " + err)
                return res.status(403).send("Le token n'est pas défini.")
            }
            //console.log("decoded mail " + decoded.UserInfo.mail)
            //console.log("decoded role " + decoded.UserInfo.role)

            req.mail = decoded.UserInfo.mail;
            req.role = decoded.UserInfo.role;

            if (req.role != "eleve" && req.role != "classe") {
                console.log("Err middleware/verificationJWT.js > verifyJWT : role pas bon")
                return res.status(403).send("Le role précisé dans le token n'existe pas : %s", req.role)
            }
            //console.log("token ok")
            // passe au back, ce qui vient après
            next();
        }
    )
}

module.exports = { verifyJWT }