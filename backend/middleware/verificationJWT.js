const jwt = require("jsonwebtoken")

require("dotenv").config();

const verifyJWT = (req, res, next) => {
    console.log("verification cookie")
    const authHeader = req.headers['authorization'];
    // si l'utilisateur n'est pas autorisé
    if (!authHeader){
        return res.sendStatus(202)
    }
    console.log("authHeader : "+authHeader)
    // le token est en deuxième position
    const token = authHeader.split(' ')[1]
    console.log('token'+token)
    // vérification du token
    jwt.verif(
        token, 
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded)=>{
            if(err){
                return res.sendStatus(202)
            }
            console.log("decoded "+decoded)
            req.user=decoded.mail;
            // passe au back, ce qui vient après
            next();
        }
    )

}