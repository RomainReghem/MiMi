const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken")

const { determiningRole } = require('../middleware/verificationAccesDoc');
const { Eleve, Classe } = require('../models/users');
const { changePassword } = require("./modificationEleve")
const { changePasswordClass } = require("./modificationClasse")


/**
 * Fonction qui génère un token pour l'utilisateur s'il existe, et lui envoie par mail.
 * @param {*} req requête du client
 * @param {*} res réponse du serveur
 */
const sendResetPassword = (req, res) => {
    const email = req.body.mail;
    determiningRole(email, function (err, role) {
        if (err) {
            console.log(err)
            return res.status(404).send("Nous n'avons pas trouvé d'utilisateur avec cette adresse mail.")
        }
        else if (role == "eleve") {
            // on génère un token
            const passToken = jwt.sign(
                { "mail": email, "role": "eleve" },
                process.env.PASSWORD_TOKEN_SECRET,
                { expiresIn: '1d' }
            )
            // on va l'ajouter dans la bd maintenant
            Eleve.update(
                { tokenMail: passToken },
                { where: { courriel: email } }
            )
                .then(() => {
                    // une fois que le token a été ajouté, on peut envoyer le mail contenant le token 
                    sendEmail(email, passToken, function (err) {
                        if (err) {
                            return res.status(520).send(err)
                        } else {
                            return res.status(201).send("Vous recevrez un mail contenant les instructions de réinitialisation sous peu.")
                        }
                    });

                })
                .catch(err => {
                    console.log("Err controllers/changementMotDePasse.js : sendResetPassword, eleve.update " + err)
                    return res.status(520).send("Erreur lors de la tentative de création de lien pour la reinitialisation.")
                })
        } else {
            const passToken = jwt.sign(
                { "mail": email, "role": "classe" },
                process.env.PASSWORD_TOKEN_SECRET,
                { expiresIn: '30m' }
            )
            Classe.update(
                { tokenMail: passToken },
                { where: { courriel: email } }
            )
                .then(() => {
                    // une fois que le token a été ajouté, on peut envoyer le mail contenant le token 
                    sendEmail(email, passToken, function (err) {
                        if (err) {
                            return res.status(520).send(err)
                        } else {
                            return res.status(201).send("Vous recevrez un mail contenant les instructions de réinitialisation sous peu.")
                        }
                    });
                })
                .catch(err => {
                    console.log("Err controllers/changementMotDePasse.js : sendResetPassword, classe.update " + err)
                    return res.status(520).send("Erreur lors de la tentative de création de lien pour la reinitialisation.")
                })
        }
    })
}

/**
 * Permet de changer le mot de passe, si le token et le mot de passe donnés sont valides.
 * @param {*} req la requête du client, contient notamment le mot de passe et le token.
 * @param {*} res la réponse du serveur
 * @returns la réponse du serveur, une erreur ou un succès, en fonction des codes http
 */
const resetPassword = (req, res) => {
    const email = req.mail;
    const role = req.role;

    const mdp = req.body.pwd;

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("Err controllers/changementMotDePasse.js > resetPassword : taille mdp pas ok")
        return res.status(400).send("Le mot de passe n'est pas de la bonne forme ! ")
    }

    if (role == "eleve") {
        Eleve.findOne({ attributes: ['tokenMail'], where: { courriel: email } })
            .then(eleve => {
                if (!eleve) {
                    console.log("Err controllers/changementMotDePasse.js : resetPassword, pas d'élève trouvé avec l'adr %s", email)
                    return res.status(404).send("Le token est invalide, ce n'est pas le bon utilisateur.")
                }
                if (eleve.tokenMail == req.body.token) {
                    changePassword(email, mdp, function (err, msg) {
                        if (err) {
                            return res.status(520).send(err);
                        }
                        return res.status(201).send(msg);
                    })
                } else {
                    console.log("Err controllers/changementMotDePasse.js : le token ne correspond pas pour l'eleve")
                    return res.status(403).send("Tentative d'accès avec un lien incorrect");
                }

            })
            .catch(err => {
                console.log("Err controllers/changementMotDePasse.js : sendResetPassword, eleve.findOne => " + err)
                return res.status(520).send("Il y a eu une erreur lors de la vérification du compte.")
            })
    } else {
        Classe.findOne({ attributes: ['tokenMail'], where: { courriel: email } })
            .then(classe => {
                if (!classe) {
                    console.log("Err controllers/changementMotDePasse.js : resetPassword, pas de classe trouvée avec l'adr %s", email)
                    return res.status(404).send("Le token est invalide, ce n'est pas le bon utilisateur.")
                }
                if (classe.tokenMail == req.body.token) {
                    changePasswordClass(email, mdp, function (err, msg) {
                        if (err) {
                            return res.status(520).send(err);
                        }
                        return res.status(201).send(msg);
                    })
                } else {
                    console.log("Err controllers/changementMotDePasse.js : le token ne correspond pas pour la classe")
                    return res.status(403).send("Tentative d'accès avec un lien incorrect");
                }
            })
            .catch(err => {
                console.log("Err controllers/changementMotDePasse.js : sendResetPassword, classe.findOne => " + err)
                return res.status(520).send("Il y a eu une erreur lors de la vérification du compte.")
            })
    }
}


/**
 * Fonction qui envoie un mail contenant les instructions pour la reinitialisation du mot de passe de l'utilisateur à l'aide du token donnée.
 * @param {String} email l'email de l'utilisateur à qui on doit envoyer un lien de reinitialisation 
 * @param {String} token le token pour la reinitialisation du mot de passe
 * @param {*} callback la fonction callback qui permet de retourner une erreur ou rien quand la fonction a terminé de s'exécuter
 */
function sendEmail(email, token, callback) {
    var email = email;
    var token = token;

    var mail = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD,
        }
        });
    //http://localhost:3000
    //https://mimi.connected-health.fr
    var mailOptions = {
        from: process.env.MAIL_ID,
        to: email,
        subject: "Demande de changement de mot de passe sur mimi.connected-health.fr",
        html: `<html><body><p>Bonjour,</p>
            <br/>
            <p>
            Vous avez fait une demande de changement de mot de passe pour votre compte Mimi. <br/>
            Pour changer votre mot de passe, <a href="https://mimi.connected-health.fr/pwdreset?token=${token}">appuyez ici</a> ou copiez le lien ci dessous dans votre navigateur : 
            <br/>https://mimi.connected-health.fr/pwdreset?token=${token}
            <br/>
            <strong>(Attention, ce lien est valide seulement pendant 30 minutes.)</strong>
            </p>
            <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter à l'adresse suivante : mimi@connected-health.fr</p>
            <br/>
            <p>Cordialement, l'équipe du projet MIMI </p>
            </body></html>`
    }
    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Err controllers/eleve.js > sendEmail : erreur lors de l'envoi du mail " + error)
            return callback("Erreur lors de l'envoi du mail.")
        } else {
            console.log("mail envoyé ")
            return callback(null)
        }
    });
}


module.exports = {
    sendResetPassword,
    resetPassword
}