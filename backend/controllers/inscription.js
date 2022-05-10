//const db = require('../utils/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require("path")

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

/**
 * Crée un compte élève, avec les données transmises par le serveur.
 * Crée aussi des dossiers pour stocker les futurs documents de l'élève.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const InscriptionEleve = (req, res) => {
    /*données de test valides
    const pseudo = "eleve10";
    const prenom = "test";
    const nom = "test";
    const email = "eleve10@test.fr";
    const mdp = "testoror";*/

    const pseudo = req.body.user;
    const prenom = req.body.firstName;
    const nom = req.body.name;
    const email = req.body.mail;
    const mdp = req.body.pwd;

    console.log(pseudo + prenom + nom + email + mdp)
    // Prenom doit etre compris entre 2 et 24 caractères de l'alphabet, y compris les accents minuscules 
    if (!(prenom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("taille prenom pas bonne")
        return res.sendStatus(403)
    }
    //console.log("prenom ok")
    // Nom doit être compris entre 1 et 44 inclus 
    if (!(nom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("nom incorrect")
        return res.sendStatus(404)
    }
    //console.log("nom ok")

    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("pseudo pas ok")
        return res.sendStatus(405)
    }
    //console.log("pseudo ok")

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.sendStatus(406)
    }
    //console.log("mdp ok")

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(407)
    }
    //console.log("email ok")


    // Hashage du mot de passe
    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            console.log(err)
        }
        Eleve.findOne({ where: { pseudo: pseudo } })
            .then(eleve => {
                // si on trouve un élève qui a déjà ce pseudo
                if (eleve) {
                    console.log("Pseudo pas unique");
                    res.sendStatus(408)
                } else {
                    console.log("pseudo valide")
                    // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
                    Eleve.findOne({ where: { courriel: email } })
                        .then(eleve => {
                            if (eleve) {
                                console.log("Mail pas unique");
                                res.sendStatus(409)
                            } else {
                                console.log("mail unique pour eleves");
                                Classe.findOne({ where: { courriel: email } })
                                    .then(classe => {
                                        if (classe) {
                                            console.log("Mail existant pour la classe");
                                            res.sendStatus(410)
                                        } else {
                                            console.log("inscription ok")
                                            console.log("mdp" + hash)
                                            const neweleve = Eleve.create(({
                                                pseudo: pseudo,
                                                courriel: email,
                                                motdepasse: hash,
                                                nom: nom,
                                                prenom: prenom
                                            }))
                                                .then((eleve) => {
                                                    console.log("Création de compte élève réussie")
                                                    const num = eleve.ideleve
                                                    const path = "./testeleve/eleve" + num + "/avatar"


                                                    console.log("*** Création d'un dossier ***")

                                                    try {
                                                        if (!fs.existsSync('./testeleve')) {
                                                            fs.mkdirSync('./testeleve');
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        return res.status(600).send("Erreur lors de la création de dossier test")
                                                    }

                                                    try {
                                                        if (!fs.existsSync('./testeleve/eleve' + num)) {
                                                            fs.mkdirSync('./testeleve/eleve' + num);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        return res.status(600).send("Erreur lors de la création de dossier classe")
                                                    }

                                                    try {
                                                        if (!fs.existsSync(path)) {
                                                            fs.mkdirSync(path);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        return res.status(600).send("Erreur lors de la création de dossier avatar")
                                                    }

                                                    /* let avatar = JSON.stringify({
                                                             bgColor: "#E0DDFF",
                                                             earSize: "small",
                                                             eyeBrowStyle: "up",
                                                             eyeStyle: "oval",
                                                             faceColor: "#AC6651",
                                                             glassesStyle: "none",
                                                             hairColor: "#000",
                                                             hairStyle: "thick",
                                                             hatColor: "#000",
                                                             hatStyle: "none",
                                                             mouthStyle: "laugh",
                                                             noseStyle: "round",
                                                             shape: "square",
                                                             shirtColor: "#6BD9E9",
                                                             shirtStyle: "polo"
                                                         }
                                                         )*/
                                                    // let avatar = '{bgColor: "#E0DDFF", earSize: "small", eyeBrowStyle: "up", eyeStyle: "oval", faceColor: "#AC6651", glassesStyle: "none", hairColor: "#000", hairStyle: "thick", hatColor: "#000", hatStyle: "none", mouthStyle: "laugh", noseStyle: "round", shape: "square", shirtColor: "#6BD9E9", shirtStyle: "polo"}'
                                                    // enregistrement de l'avatar par défaut
                                                    let avatar = {
                                                        bgColor: "#E0DDFF",
                                                        earSize: "small",
                                                        eyeBrowStyle: "up",
                                                        eyeStyle: "oval",
                                                        faceColor: "#AC6651",
                                                        glassesStyle: "none",
                                                        hairColor: "#000",
                                                        hairStyle: "thick",
                                                        hatColor: "#000",
                                                        hatStyle: "none",
                                                        mouthStyle: "laugh",
                                                        noseStyle: "round",
                                                        shape: "square",
                                                        shirtColor: "#6BD9E9",
                                                        shirtStyle: "polo"
                                                    }
                                                    // avatar=JSON.parse(avatar)
                                                    //  console.log("\n2."+avatar)
                                                    avatar = JSON.stringify(avatar)

                                                    console.log("dossiers créés")

                                                    console.log("enregistrement d'un avatar")
                                                    fs.writeFile(path + "/avatar" + num + ".json", avatar, 'utf8', function (err) {
                                                        if (err) {
                                                            console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
                                                            return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                                                        }
                                                        console.log("Le fichier JSON a bien été sauvegardé");
                                                        //res.status(201).send("Enregistrement effectué");
                                                    });
                                                    res.send(neweleve);
                                                })
                                                .catch(err => {
                                                    console.log("erreur inscription eleve : " + err)
                                                })
                                        }
                                    }
                                    )
                            }
                        })

                }
            }
            )
    }
    )
}

/**
 * Enregistre dans la base de données les informations sur la nouvelle classe transmise par le client.
 * Vérifie la validité des informations, notamment l'unicité de l'email (aucun utilisateur ne doit avoir le même)
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const InscriptionClasse = (req, res) => {
    /*données de test valides
    const pseudo = "eleve10";
    const prenom = "test";
    const nom = "test";
    const email = "eleve10@test.fr";
    const mdp = "testoror";*/

    const email = req.body.mail;
    const mdp = req.body.pwd;

    console.log(email + mdp)

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        res.sendStatus(406)
    }
    //console.log("mdp ok")

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        res.sendStatus(407)
    }
    //console.log("email ok")

    // On fait des vérifications sur les insertions avant d'insérer dans BD
    // La base de données a déjà des contraintes mais il faut éviter d'insérer et de causer une erreur SQL

    // On vérifie que dans la table classe aucun classe ne possède déjà cet email
    Classe.findOne({ where: { courriel: email } })
        .then(classe => {
            if (classe) {
                console.log("Mail existant pour la classe");
                return res.sendStatus(409)
            } else {
                Eleve.findOne({ where: { courriel: email } })
                    .then(eleve => {
                        if (eleve) {
                            console.log("Mail existant pour un eleve");
                            return res.sendStatus(411)
                        } else {
                            // Hashage du mot de passe
                            bcrypt.hash(mdp, 10, (err, hash) => {
                                if (err) {
                                    console.log("erreur hashage mdp classe" + err)
                                    return res.sendStatus(600)
                                } else {
                                    const newclasse = Classe.create(({
                                        courriel: email,
                                        motdepasse: hash
                                    }))
                                        .then((classe) => {
                                            const num = classe.idclasse;

                                            console.log("Création de compte classe réussie, idclasse : " + num)

                                            console.log("** Création des dossiers **")

                                            try {
                                                if (!fs.existsSync('./testclasse')) {
                                                    fs.mkdirSync('./testclasse');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                return res.status(600).send("Erreur lors de la création de dossier test")
                                            }
                                            try {
                                                if (!fs.existsSync('./testclasse/classe' + num)) {
                                                    fs.mkdirSync('./testclasse/classe' + num);
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                return res.status(600).send("Erreur lors de la création de dossier classe")
                                            }

                                            return res.send(newclasse);

                                        })
                                        .catch(err => {
                                            console.log("erreur inscription classe : " + err)
                                        })
                                }

                            });
                        }
                    });
            }
        });
}


module.exports = { InscriptionClasse, InscriptionEleve };