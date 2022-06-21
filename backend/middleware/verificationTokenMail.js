const jwt = require("jsonwebtoken")

require("dotenv").config();

/**
 * Vérifie la validité du token, s'il est valide, enregistre dans la requete le mail et le role (eleve ou classe) de l'utilisateur dont on va changer le mdp
 * @param {*} req la requête
 * @param {*} res la réponse
 * @param {*} next ce qui suit
 * @returns une erreur, s'il y en a 
 */
const verifyTokenMail = (req, res, next) => {
    // le token est en deuxième position
    const token = req.body.token;
    //console.log("token : "+token)
    // vérification du token
    jwt.verify(
        token,
        process.env.PASSWORD_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                console.log("Err middleware/verificationTokenMail.js > verifyTokenMail : token pas bon : " + err)
                return res.status(403).send("Le token n'est pas défini.")
            }
            req.mail = decoded.mail;
            req.role = decoded.role;
            console.log("decode mail %s et role %s", req.mail, req.role)

            if (req.role != "eleve" && req.role != "classe") {
                console.log("Err middleware/verificationTokenMail.js > verifyTokenMail : role pas bon")
                return res.status(403).send("Le role précisé dans le token n'existe pas : %s", req.role)
            }
            // passe au back, ce qui vient après, la fonction pour réinitialiser le mdp
            next();
        }
    )
}

module.exports = { verifyTokenMail }