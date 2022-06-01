const jwt = require('jsonwebtoken');
const { getInvitation } = require('./eleve');
const Users = require('../models/users');
const Classe = Users.Classe;
const Eleve = Users.Eleve;
const Refresh = Users.RefreshToken;


require('dotenv').config()

/**
 * Si l'authentification et l'autorisation sont correctes, remets à jour le token d'accès.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur,
 */
const refreshToken = (req, res) => {
    console.log("\n*** Rafraichissement des tokens ***")
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        console.log("accès refusé")
        // 401 : authentification raté
        return res.status(401).send("accès refusé")
    }
    const refreshToken = cookies.jwt;
    console.log("refreshToken : " + refreshToken)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded == undefined) {
                console.log("probleme lors de la verification " + err);
                // accès interdit
                return res.sendStatus(403);
            } else {
                console.log("decodage des infos")
                const mail = decoded.mail;
                const role = decoded.role;
                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "mail": mail,
                            "role": role
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '20m' });
                if (role == "eleve") {
                    console.log("token eleve " + mail)
                    Eleve.findOne({
                        attributes: ['token'],
                        where: { courriel: mail }
                    })
                        .then(eleve => {
                            if (!eleve) {
                                console.log("Aucun eleve n'a ce token")
                                return res.send("Aucun eleve n'a ce token : accès interdit").status(403)
                            }
                            console.log("eleve token " + eleve.token)
                            if (eleve.token != refreshToken) {
                                console.log("Le token donné ne correspond pas à l'utilisateur")
                                return res.send("Le token donné ne correspond pas à l'utilisateur : accès interdit").status(403)
                            }
                            // on doit récupèrer l'état de l'invitation pour le transmettre au serveur
                            getInvitation(mail, function (reponse) {
                                if (reponse == 404 || reponse == 407) {
                                    console.log("Erreur lors de la récupération de l'invitation " + reponse)
                                    return res.sendStatus(reponse)
                                } else {
                                    console.log('envoi des infos')
                                    return res.status(201).json(Object.assign({ role: role, accessToken: accessToken }, reponse));
                                }
                            })
                        }).catch(err => {
                            console.log("erreur lors de la recup de classe " + err)
                            return res.send(err).status(520)
                        });
                } else if (role == "classe") {
                    console.log("token classe")
                    Classe.findOne({ attributes: ['idclasse','token'], where: { courriel: mail } })
                        .then(classe => {
                            if (!classe) {
                                console.log("pas de classe avec ce token ")
                                // le mail ne correspond à aucune mail : accès interdit
                                return res.sendStatus(403)
                            }
                            if (classe.token != refreshToken) {
                                return res.send("Le token donné ne correspond pas à l'utilisateur : accès interdit").status(403)
                            }
                            // sinon si c'est une classe on retourne juste le role et le nouveau accesstoken + l'id de la classe
                            return res.status(201).json({ role: role, accessToken: accessToken, idclasse: classe.idclasse });
                        }
                        ).catch(err => {
                            console.log("erreur lors de la recup de classe " + err)
                            return res.send(err).status(520)
                        });
                } else {
                    console.log("what is this role? " + role)
                    return res.send("Role inexistant : accès interdit").status(403)
                }
            }
        }
    )
}

module.exports = { refreshToken };
