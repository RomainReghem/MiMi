const jwt = require('jsonwebtoken');
const { getInvitation } = require('./eleve');
const { getAvatar, getImage, getAvatarAsImage } = require("./image")
const Users = require('../models/users');
const Classe = Users.Classe;
const Eleve = Users.Eleve;

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
        return res.status(401).send("Accès refusé : aucun cookie présent")
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
                return res.status(403).send("Echec de la vérification des informations.");
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
                        attributes: ['ideleve', 'token', "pseudo"],
                        where: { courriel: mail }
                    })
                        .then(eleve => {
                            if (!eleve) {
                                console.log("Aucun eleve n'a ce token")
                                return res.status(403).send("Aucun eleve n'a ce token : accès interdit")
                            }
                            console.log("eleve token " + eleve.token)
                            if (eleve.token != refreshToken) {
                                console.log("Le token donné ne correspond pas à l'utilisateur")
                                return res.status(403).send("Le token donné ne correspond pas à l'utilisateur : accès interdit")
                            }
                            // on doit récupèrer l'état de l'invitation pour le transmettre au serveur
                            getInvitation(mail, function (reponse) {
                                if (reponse == 404 || reponse == 400 || 520==reponse) {
                                    console.log("Erreur lors de la récupération de l'invitation " + reponse)
                                    return res.sendStatus(reponse)
                                } else {
                                    getAvatar(mail, function (reponseAvatar) {
                                        getImage(mail, function (err, reponseImage) {
                                            if (err) {
                                                return res.status(520).send(err);
                                            }
                                            getAvatarAsImage(mail, function(err, reponseAvatarAsImage){
                                                if (err) {
                                                    return res.status(520).send(err);
                                                }
                                                //console.log('envoi des infos')
                                                return res.status(200).json(Object.assign({ role: "eleve", accessToken: accessToken }, reponse, { pseudo: eleve.pseudo }, reponseAvatar,reponseAvatarAsImage, reponseImage));
                                            })                                        })
                                    })

                                }
                            })
                        }).catch(err => {
                            console.log("erreur lors de la recup de classe " + err)
                            return res.status(520).send("Erreur lors de la vérification des données.")
                        });
                } else if (role == "classe") {
                    console.log("token classe")
                    Classe.findOne({ attributes: ['idclasse', 'token'], where: { courriel: mail } })
                        .then(classe => {
                            if (!classe) {
                                console.log("pas de classe avec ce token ")
                                // le mail ne correspond à aucune mail : accès interdit
                                return res.status(403).send("Validation échouée, compte invalide.")
                            }
                            if (classe.token != refreshToken) {
                                console.log("token classe correspond pas")
                                return res.status(403).send("Le token donné ne correspond pas à l'utilisateur : accès interdit")
                            }
                            console.log('token nickel')
                            // sinon si c'est une classe on retourne juste le role et le nouveau accesstoken + l'id de la classe
                            return res.status(200).json({ role: role, accessToken: accessToken, idclasse: classe.idclasse });
                        }
                        ).catch(err => {
                            console.log("erreur lors de la recup de classe " + err)
                            return res.status(520).send("Erreur lors de la récupérations des informations du compte Classe");
                        });
                } else {
                    console.log("what is this role? " + role)
                    return res.status(403).send("Role inexistant : accès interdit");
                }
            }
        }
    )
}


module.exports = { refreshToken };
