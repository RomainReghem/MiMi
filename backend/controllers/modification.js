const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;
const bcrypt = require('bcrypt');
const { send } = require('express/lib/response');
let refreshTokens = require('./connexion').refreshTokens;


const ChangementMdp = (req, res) => {
    const email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;
    console.log("yepppp " + email + " mdp " + mdp + " newMdp " + newMdp)
    console.log("*** Vérification mot de passe ***")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    }

    if (!(newMdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    }

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    }

    // on cherche un eleve qui a le mail donné
    Eleve.findOne({ where: { courriel: email } })
        .then(eleve => {
            if (eleve) {
                // on vérifie maintenant dans la bd si le mdp donné est bien celui associé au mail
                bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                    if (estValide) {
                        console.log("Bon mot de passe de l'élève")
                        bcrypt.hash(newMdp, 10, (err, hash) => {
                            if (err) {
                                //erreur lors du hahage
                                res.sendStatus(300)
                            }
                            // on change le mdp
                            const neweleve = Eleve.update(
                                {
                                    motdepasse: newMdp,
                                },
                                {
                                    where: { courriel: email },
                                }
                            );
                        });
                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                        res.send(neweleve)
                    } else {
                        console.log("Mauvais mot de passe ELEVE")
                        res.sendStatus(400)
                    }
                });
                // si on ne trouve pas, c'est peut etre une classe
            } else {
                Classe.findOne({ where: { courriel: email } })
                    .then(classe => {
                        if (!classe) {
                            res.status(404).send("Aucun compte correspondant à cet adresse.")
                        }
                        // comparaion du mdp avec celui connu
                        bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                            if (estValide) {
                                console.log("Bon mot de passe de la classe")
                                // on change le mdp
                                // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                bcrypt.hash(newMdp, 10, (err, hash) => {
                                    if (err) {
                                        //erreur lors du hahage
                                        res.sendStatus(300)
                                    }
                                    const newclasse = Classe.update(
                                        {
                                            motdepasse: hash,
                                        },
                                        {
                                            where: { courriel: email },
                                        }
                                    );
                                    // on envoie la classe avec le mdp modifié 
                                    res.send(newclasse)
                                });
                            } else {
                                console.log("Mauvais mot de passe classe")
                                res.sendStatus(400)
                            }
                        });
                    })
            }
        });

}

const ChangementMail = (req, res) => {
    const email = req.body.mail;
    const newEmail = req.body.newMail;
    const mdp = req.body.pwd;

    console.log("*** Vérification mail ***")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    }

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    }

    if (!(newEmail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= newEmail.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    }

    // on cherche un eleve qui a le mail donné
    Eleve.findOne({ where: { courriel: email } })
        .then(eleve => {
            // un eleve est bien associé à l'ancien mail
            if (eleve) {
                // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
                Eleve.findOne({ where: { courriel: newEmail } })
                    .then(eleve => {
                        if (eleve) {
                            console.log("Mail pas unique");
                            res.sendStatus(409)
                        } else {
                            console.log("mail unique pour eleves");
                            Classe.findOne({ where: { courriel: newEmail } })
                                .then(classe => {
                                    if (classe) {
                                        console.log("Mail existant pour la classe");
                                        res.sendStatus(410)
                                    } else {
                                        // on vérifie maintenant dans la bd si le mdp donné est bien celui associé au mail
                                        bcrypt.compare(mdp, eleve.motdepasse, function (err, estValide) {
                                            if (estValide) {
                                                console.log("Bon mot de passe de l'élève")
                                                // on change le mdp
                                                const neweleve = Eleve.update(
                                                    {
                                                        courriel: newEmail,
                                                    },
                                                    {
                                                        where: { motdepasse: mdp },
                                                    }
                                                );
                                                // Comme on a changé l'adresse mail, on doit aussi changer les tokens
                                                const cookies = req.cookies;
                                                console.log("refresh cookies" + cookies);
                                                if (!cookies?.jwt) {
                                                    console.log("accès refusé")
                                                    // 401 : authentification raté
                                                    return res.sendStatus(201)
                                                }
                                                const refreshTokenOld = cookies.jwt;
                                                if (!refreshTokens.includes(refreshTokenOld)) {
                                                    //token invalide 
                                                    return res.sendStatus(400)
                                                }
                                                jwt.verify(
                                                    refreshTokenOld,
                                                    process.env.REFRESH_TOKEN_SECRET,
                                                    (err, decoded) => {
                                                        if (err) {
                                                            //refreshTokens = refreshTokens.filter((c) => c != refreshToken)
                                                            console.log(err);
                                                            // accès interdit
                                                            res.sendStatus(403);
                                                        } else {
                                                            if (decoded.mail == email) {
                                                                // on retire l'ancien refreshtoken de la liste
                                                                refreshTokens = refreshTokens.filter((c) => c != refreshToken)
                                                                // on crée de nouveaux token 
                                                                console.log("*** Recréation des cookies pour l'élève ***")
                                                                // cookie 
                                                                const accessToken = jwt.sign(
                                                                    { "mail": newEmail, "role": "eleve" },
                                                                    process.env.ACCESS_TOKEN_SECRET,
                                                                    { expiresIn: '10m' }
                                                                );
                                                                const refreshToken = jwt.sign(
                                                                    { "mail": newEmail, "role": "eleve" },
                                                                    process.env.REFRESH_TOKEN_SECRET,
                                                                    { expiresIn: '1d' }
                                                                )
                                                                // on insère dans la liste le nouveau refreshtoken
                                                                refreshTokens.push(refreshToken);
                                                                res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
                                                                res.json({ accessToken: accessToken })
                                                            } else {
                                                                res.sendStatus(403)
                                                            }

                                                        }
                                                    }
                                                )
                                            } else {
                                                console.log("Mauvais mot de passe ELEVE")
                                                res.sendStatus(400)
                                            }
                                        });
                                    }
                                });
                        }
                    });

                // si on ne trouve pas, c'est peut etre une classe
            } else {
                // on cherche si il existe une classe correspondante à l'aide de l'ancien mail
                Classe.findOne({ where: { courriel: email } })
                    .then(classe => {
                        // s'il n'y aucune classe  qui a été trouvée alors aucun compte ne correspond à ce mail
                        if (!classe) {
                            res.status(404).send("Aucun compte correspondant à cet adresse.")
                        }
                        // On vérifie que dans la table classe aucune classe ne possède déjà la nouvelle adresse mail
                        Classe.findOne({ where: { courriel: newEmail } })
                            .then(classe => {
                                if (classe) {
                                    console.log("Mail existant pour la classe");
                                    //res.sendStatus(409)
                                    res.send("409").status('Adresse déjà utilisée par un compte classe')
                                } else {
                                    // on vérifie que l'adresse mail n'est aussi pas déjà prise par un élève
                                    Eleve.findOne({ where: { courriel: newEmail } })
                                        .then(eleve => {
                                            // si on trouve un eleve, c'est qu'il est enregistré avec le nouveau mail
                                            if (eleve) {
                                                console.log("Mail existant pour un eleve");
                                                // res.sendStatus(411)
                                                res.send("409").status('Adresse déjà utilisée par un élève')
                                            } else {
                                                // comparaion du mdp avec celui connu
                                                bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                                    if (estValide) {
                                                        console.log("Bon mot de passe de la classe")
                                                        // on change le mdp
                                                        // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                                        const newclasse = Classe.update(
                                                            {
                                                                courriel: newEmail,
                                                            },
                                                            {
                                                                where: { motdepasse: mdp },
                                                            }
                                                        );
                                                        // on envoie la nouvelle classe 
                                                        res.send(newclasse)
                                                    } else {
                                                        console.log("Mauvais mot de passe classe")
                                                        res.sendStatus(400)
                                                    }
                                                });
                                            }
                                        })
                                }
                            });
                    })
            }
        });
}

module.exports = { ChangementMdp, ChangementMail }