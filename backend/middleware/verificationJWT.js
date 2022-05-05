const jwt = require("jsonwebtoken")

require("dotenv").config();

const verifyJWT = (req, res, next) => {
    console.log("verification cookie")
    for(e in req.headers){
        console.log("test" +e)
    }
    console.log(req.accessToken+" cookie "+req.cookie+" autre tesr"+req.header.auth)
    console.log("requetes"+req.headers['cookie'])
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // si l'utilisateur n'est pas autorisé
    if (!authHeader) {
        console.log("pas de header")
        return res.sendStatus(600)
    }
    console.log("authHeader : " + authHeader)
    // le token est en deuxième position
    const token = authHeader.split(' ')[1]
    console.log('token' + token)
    // vérification du token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.sendStatus(202)
            }
            console.log("decoded " + decoded)
            req.mail = decoded.UserInfo.mail;
            req.role = decoded.UserInfo.role
            // passe au back, ce qui vient après
            next();
        }
    )

}

module.exports = { verifyJWT }