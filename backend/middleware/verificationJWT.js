const jwt = require("jsonwebtoken")

require("dotenv").config();

const verifyJWT = (req, res, next) => {
    console.log("\n*** Vérification du token (accessToken) ***")
    /* console.log(req.accessToken+" cookie "+req.cookie+" autre tesr"+req.header.auth)*/
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // si l'utilisateur n'est pas autorisé
    if (!authHeader) {
        console.log("pas de header")
        return res.sendStatus(600)
    }
    //console.log("authHeader : " + authHeader)
    // le token est en deuxième position
    const token = authHeader.split(' ')[1]
    // vérification du token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                console.log("token pas bon")
                return res.sendStatus(403)
            }
            console.log("decoded mail " + decoded.UserInfo.mail)
            console.log("decoded role " + decoded.UserInfo.role)

            req.mail = decoded.UserInfo.mail;
            req.role = decoded.UserInfo.role;

            if (req.role != "eleve" && req.role != "classe") {
                console.log("role pas bon")
                return res.status(409)
            }
            console.log("token ok")
            // passe au back, ce qui vient après
            next();
        }
    )

}

module.exports = { verifyJWT }