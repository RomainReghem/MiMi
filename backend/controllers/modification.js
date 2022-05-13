const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = require('./connexion').refreshTokens;

/**
 * Change dans la base de données le mot de passe de l'utilsateur donné.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementMdp = (req, res) => {
    console.log("\n*** Changement de mot de passe ***")
    let test = req.query.mail
    let email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;

    /*if (email == "") {
        console.log("MAIL VIDE")
        const refreshTokenOld = req.cookies.jwt;

        jwt.verify(
            refreshTokenOld,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                email = decoded.mail
            }
        )
    }*/

    console.log("mail " + email + " mdp " + mdp + " newMdp " + newMdp + " param " + test)
    console.log("** Vérification mot de passe **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    } else if (!(newMdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    } else if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    } else if (mdp == newMdp) {
        console.log("Mot de passe inchangé !")
        res.send("406").status("Mot de passe inchangé !")
    } else {
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
                                        motdepasse: hash,
                                    },
                                    {
                                        where: { ideleve: eleve.ideleve },
                                    }
                                );
                                // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                res.send(neweleve)
                            });

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
                                                where: { idclasse: classe.idclasse },
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
}

/**
 * Change dans la base de données l'email de l'utilisateur, dont l'ancien email et le mot de passe sont donné.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementMail = (req, res) => {
    console.log("\n*** Changement d'adresse mail ***")
    let email = req.body.mail;
    const newEmail = req.body.newMail;
    const mdp = req.body.pwd;
    console.log("email " + email + " new " + newEmail + " mdp " + mdp)

    /* if (email == "") {
         console.log("MAIL VIDE")
         const refreshTokenOld = req.cookies.jwt;
 
         jwt.verify(
             refreshTokenOld,
             process.env.REFRESH_TOKEN_SECRET,
             (err, decoded) => {
                 email = decoded.mail
             }
         )
     }*/

    console.log("** Vérification mail **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    } else if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    } else if (!(newEmail.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= newEmail.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    } else if (newEmail == email) {
        console.log("mails identiques")
        res.status(600).send("Mail identiques")
    } else {

        // on cherche un eleve qui a le mail donné
        Eleve.findOne({ where: { courriel: email } })
            .then(eleve => {
                // un eleve est bien associé à l'ancien mail
                if (eleve) {
                    // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
                    Eleve.findOne({ where: { courriel: newEmail } })
                        .then(eleve2 => {
                            if (eleve2) {
                                console.log("Mail pas unique");
                                res.sendStatus(409)
                            } else {
                                // console.log("mail unique pour eleves");
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
                                                    Eleve.update(
                                                        {
                                                            courriel: newEmail,
                                                        },
                                                        {
                                                            where: { ideleve: eleve.ideleve },
                                                        }
                                                    ).then(newEleve => {
                                                        if (newEleve) {
                                                            console.log("Changement de mail ok")
                                                            // Comme on a changé l'adresse mail, on doit aussi changer les tokens
                                                            const cookies = req.cookies;
                                                            //console.log("refresh cookies" + cookies.jwt);
                                                            if (!cookies?.jwt) {
                                                                console.log("accès refusé")
                                                                // 401 : authentification raté
                                                                return res.status(401).send("Accès refusé : authentification requise")
                                                            }
                                                            const refreshTokenOld = cookies.jwt;
                                                            if (!refreshTokens.includes(refreshTokenOld)) {
                                                                //token invalide 
                                                                return res.status(403).send("Accès interdit : autorisation nécessaire")
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
                                                                            refreshTokens = refreshTokens.filter((c) => c != refreshTokenOld)
                                                                            // on crée de nouveaux token 
                                                                            console.log("*** Recréation des cookies pour l'élève ***")
                                                                            // cookie 
                                                                            const accessToken = jwt.sign(
                                                                                { "UserInfo": { "mail": newEmail, "role": "eleve" } },
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
                                                                            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                                            res.json({ accessToken: accessToken })
                                                                        } else {
                                                                            res.sendStatus(403)
                                                                        }

                                                                    }
                                                                }
                                                            )
                                                            //res.sendStatus(201)
                                                        } else {
                                                            res.status(600).send("non défini")
                                                        }

                                                    }).catch(err => {
                                                        console.log(err)
                                                        res.sendStatus(600)
                                                    });
                                                } else {
                                                    console.log("Mauvais mot de passe de l'eleve")
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
                                .then(classe2 => {
                                    if (classe2) {
                                        console.log("Mail existant pour la classe");
                                        //res.sendStatus(409)
                                        res.status(409).send('Adresse déjà utilisée par un compte classe')
                                    } else {
                                        // on vérifie que l'adresse mail n'est aussi pas déjà prise par un élève
                                        Eleve.findOne({ where: { courriel: newEmail } })
                                            .then(async eleve => {
                                                // si on trouve un eleve, c'est qu'il est enregistré avec le nouveau mail
                                                if (eleve) {
                                                    console.log("Mail existant pour un eleve");
                                                    // res.sendStatus(411)
                                                    res.status(409).send('Adresse déjà utilisée par un élève')
                                                } else {
                                                    // comparaion du mdp avec celui connu
                                                    bcrypt.compare(mdp, classe.motdepasse, function (err, estValide) {
                                                        if (estValide) {
                                                            console.log("Bon mot de passe de la classe")
                                                            // on change le mail
                                                            // si le mot de passe entré correspond bien au mot de passe dans la base de données
                                                            Classe.update(
                                                                {
                                                                    courriel: newEmail,
                                                                },
                                                                {
                                                                    where: { idclasse: classe.idclasse },
                                                                }
                                                            ).then(async newclasse => {
                                                                if (newclasse) {
                                                                    console.log("update ok : " + newclasse.idclasse + newclasse.courriel)
                                                                    // console.log("\n*** Recréation des tokens ***")
                                                                    const cookies = req.cookies;
                                                                    //console.log("refresh cookies" + cookies.jwt);
                                                                    if (!cookies?.jwt) {
                                                                        console.log("accès refusé")
                                                                        // 401 : authentification raté
                                                                        return res.status(401).send("Accès refusé : authentification requise")
                                                                    }
                                                                    const refreshTokenOld = cookies.jwt;
                                                                    if (!refreshTokens.includes(refreshTokenOld)) {
                                                                        //token invalide 
                                                                        return res.status(403).send("Accès interdit : autorisation nécessaire")
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
                                                                                    refreshTokens = refreshTokens.filter((c) => c != refreshTokenOld)
                                                                                    // on crée de nouveaux token 
                                                                                    console.log("** Recréation des cookies pour la classe **")
                                                                                    // cookie 
                                                                                    const accessToken = jwt.sign(
                                                                                        { "UserInfo": { "mail": newEmail, "role": "classe" } },
                                                                                        process.env.ACCESS_TOKEN_SECRET,
                                                                                        { expiresIn: '10m' }
                                                                                    );
                                                                                    const refreshToken = jwt.sign(
                                                                                        { "mail": newEmail, "role": "classe" },
                                                                                        process.env.REFRESH_TOKEN_SECRET,
                                                                                        { expiresIn: '1d' }
                                                                                    )
                                                                                    // on insère dans la liste le nouveau refreshtoken
                                                                                    refreshTokens.push(refreshToken);
                                                                                    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 })
                                                                                    res.json({ accessToken: accessToken })
                                                                                } else {
                                                                                    res.sendStatus(403)
                                                                                }

                                                                            }
                                                                        }
                                                                    )

                                                                    // on envoie la nouvelle classe 
                                                                    // res.status(201).send("update ok")
                                                                } else {
                                                                    res.status(500).send("non défini")
                                                                }
                                                            })
                                                                .catch(err => {
                                                                    res.status(500).send("Erreur " + err);
                                                                });

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
}

/**
 * Change le pseudo de l'élève dans la base de données.
 * Utilise l'email, l'ancien pseudo et le mot de passe donnés par le client.
 * Vérifie la validité des informations et le fait que le pseudo soit unique.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementPseudo = (req, res) => {
    const email = req.body.mail;
    const pseudo = req.body.newPseudo;
    console.log("email " + email + " new " + pseudo)

    console.log("\n*** Vérification pseudo ***")
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    } else if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("forme pseudo incorrect")
        res.sendStatus(405)
    } else {
        Eleve.findOne({ where: { courriel: email } })
            .then(eleveToChange => {
                if (!eleveToChange) {
                    res.status(401).send("Eleve pas trouvé")
                } else {
                    // sinon on ne change rien
                    if (eleveToChange.pseudo != pseudo) {

                        Eleve.update(
                            {
                                pseudo: pseudo,
                            },
                            {
                                where: { ideleve: eleveToChange.ideleve },
                            }
                        ).then(newEleve => {
                            if (newEleve) {
                                //res.sendStatus(201)
                                return res.status(201).send("Modification de pseudo réussie.")
                            } else {
                                return res.status(520).send("non défini")
                            }

                        }).catch(err => {
                            console.log(err)
                            res.status(500).send("Erreur lors de la modification de pseudo.")
                        })

                    } else {
                        //res.send(eleveToChange);
                        res.status(201).send("Pas de modification de pseudo.")
                    }
                }


            })
    }
}

/**
 * Change la préférence de l'élève pour se représenter.
 * Utilise l'email, la nouvelle préférence et le mot de passe donnés par le client.
 * Vérifie la validité des informations.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementPreference = (req, res) => {
    console.log("\n*** Changement des préférences d'un élève. ***")
    const email = req.body.mail;
    const pseudo = req.body.newPseudo;
    const preference = req.body.pref;

    console.log("** Vérification pseudo **")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        // erreur 400
        res.sendStatus(406)
    } else if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        res.sendStatus(407)
    } else if (preference != "photo" || preference != "camera" || preference != "avatar") {
        console.log("Pref pas dans les valeurs possibles (photo, camera ou avatar)")
        // erreur 400
        res.status(413).send("Préférence incorrecte.")
    } else {
        console.log("Tout est bon pour la modification de préférences")
        Eleve.findOne({ where: { courriel: email } })
            .then(eleveToChange => {
                if (!eleveToChange) {
                    // erreur 404
                    res.status(401).send("Eleve pas trouvé")
                } else {
                    // si la preference n'a pas changé, on ne change rien
                    if (eleveToChange.preference != preference) {
                        bcrypt.compare(mdp, eleveToChange.motdepasse, function (err, estValide) {
                            if (err) {
                                res.status(500).send("erreur lors du hashage")
                            } else if (estValide) {
                                Eleve.update(
                                    {
                                        preference: preference,
                                    },
                                    {
                                        where: { ideleve: eleveToChange.ideleve },
                                    }
                                ).then(newEleve => {
                                    if (newEleve) {
                                        //res.sendStatus(201)
                                        res.status(201).send("Modification de préférence réussie.")
                                    } else {
                                        res.status(520).send("Aucun élève modifié.")
                                    }

                                }).catch(err => {
                                    console.log(err)
                                    res.status(500).send("Erreur lors de la modification de préférence.")
                                })
                            }
                        });
                    } else {
                        //res.send(eleveToChange);
                        res.status(201).send("Pas de modification de préférence.")
                    }
                }
            })
    }
}

/**
 * Change la classe de l'élève.
 * Utilise l'email fourni par le client pour retrouver la classe correspondante et l'ajouter à l'élève.
 * Vérifie la validité des informations.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementClasse = (req, res) => {
    console.log("\n*** Changement de classe ***")
    const emailEleve = req.body.mail;
    const emailClasse = req.body.mailClasse;
    if (!(emailEleve.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailEleve.length) {
        console.log("forme mail élève incorrect")
        // erreur 400
        return res.status(407).send("Le mail de l'élève n'est pas de la bonne forme.")
    }
    if (!(emailClasse.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailClasse.length) {
        console.log("forme mail classe incorrect")
        // erreur 400
        return res.status(407).send("Le mail fourni de la classe n'est pas de la bonne forme.")
    }

    Classe.findOne({
        where: { courriel: emailClasse }
    }).then(classe => {
        if (!classe) {
            console.log("Pas de classe trouvée !")
            return res.status(404).send("Aucune classe trouvée correspondant à ce mail : " + emailClasse)
        }
        Eleve.findOne({
            where: { courriel: emailEleve }
        }).then(eleve => {
            if (!eleve) {
                console.log("Pas d'élève trouvé !")
                return res.status(404).send("Aucun élève trouvé correspondant à ce mail : " + emailEleve)
            }
            console.log("Début modification ")
            if (eleve.idclasse == classe.idclasse) {
                console.log("classe déjà enregistrée")
                return res.status(204).send("Cet élève est déjà enregistré avec cet classe.")
            }
            Eleve.update(
                {
                    idclasse: classe.idclasse,
                },
                {
                    where: { ideleve: eleve.ideleve },
                }
            ).then(newEleve => {
                if (newEleve) {
                    //res.sendStatus(201)
                    console.log("Modification de la classe réussie")
                    res.status(201).send("Modification de classe réussie.")
                } else {
                    res.status(520).send("Aucun élève modifié.")
                }
            })
        })

    })


}

module.exports = { ChangementMdp, ChangementMail, ChangementPseudo, ChangementPreference }