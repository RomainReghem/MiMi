//const db = require('../utils/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { verificationChemin } = require("./image")

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

const { Storage } = require('@google-cloud/storage');

const google_cloud_project_id = "oceanic-cacao-348707";
const google_cloud_keyfile = "./oceanic-cacao-348707-bcb3c919f769.json";

const storage = new Storage({
    projectId: google_cloud_project_id,
    keyFilename: google_cloud_keyfile,
});

const bucket = storage.bucket("bucket_projet_mimi");

/**
 * Crée un compte élève, avec les données transmises par le serveur.
 * Crée aussi des dossiers pour stocker les futurs documents de l'élève.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const InscriptionEleve = (req, res) => {
    console.log("\n*** Inscription de l'élève ***")
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

    // console.log(pseudo + prenom + nom + email + mdp)
    // On revérifie la forme des informations données
    // Prenom doit etre compris entre 2 et 24 caractères de l'alphabet, y compris les accents minuscules 
    if (!(prenom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("taille prenom pas bonne")
        return res.sendStatus(403)
    }
    //console.log("prenom ok")
    // Nom doit être compris entre 2 et 24 inclus et doit être composé uniquement de lettres
    if (!(nom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("nom incorrect")
        return res.sendStatus(404)
    }
    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("pseudo pas ok")
        return res.sendStatus(405)
    }
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("taille mdp pas ok")
        return res.sendStatus(406)
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(407)
    }

    // Hashage du mot de passe
    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            console.log("erreur hashage " + err)
            return res.status(600).send("Erreur lors du chiffrement du mot de passe.")
        }

        // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
        Eleve.findOne({ attributes: ['ideleve'], where: { courriel: email } })
            .then(searchEleve => {
                if (searchEleve) {
                    console.log("Mail pas unique");
                    return res.sendStatus(409)
                }
                console.log("mail unique pour eleves");
                Classe.findOne({ attributes: ['idclasse'], where: { courriel: email } })
                    .then(classe => {
                        if (classe) {
                            console.log("Mail existant pour la classe");
                            return res.sendStatus(410)
                        }
                        console.log("inscription ok")
                        console.log("mdp" + hash)
                        Eleve.create(({
                            pseudo: pseudo,
                            courriel: email,
                            motdepasse: hash,
                            nom: nom,
                            prenom: prenom
                        }))
                            .then((eleve) => {
                                console.log("Création de compte élève réussie")
                                const num = eleve.ideleve
                                //const path = "./Eleves/eleve" + num + "/avatar"
                                // console.log("*** Création d'un dossier ***")

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
                                    shirtColor: "#99ff99",
                                    shirtStyle: "polo"
                                }

                                const path = "Eleves/eleve" + num
                                avatar = JSON.stringify(avatar)
                                verificationChemin(path + "/avatar")
                                verificationChemin(path + "/depot")
                                // on enregistre le fichier JSON correspondant à l'avatar de l'élève
                                fs.writeFile(path + "/avatar/avatar" + num + ".json", avatar, 'utf8', function (err) {
                                    if (err) {
                                        console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
                                        return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                                    }
                                    console.log("Le fichier JSON a bien été sauvegardé");
                                    return res.status(201).send("Enregistrement effectué");
                                });

                                //return res.send(neweleve);
                            })
                            .catch(err => {
                                console.log("erreur inscription eleve : " + err)
                                return res.send(err).status(520)
                            })
                    })
                    .catch(err => {
                        console.log("Erreur lors de la recherche de classe \n" + err)
                        return res.send("Erreur serveur sur la vérification de la validité de l'adresse mail.").status(520)
                    });
            }).catch(err => {
                console.log("Erreur lors de la recherche d'eleve avec la meme adresse \n" + err)
                return res.send("Erreur serveur sur la vérification de la validité de l'adresse mail.").status(520)
            });
    })
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
    console.log('\n*** Inscription de la classe ***')
    const email = req.body.mail;
    const mdp = req.body.pwd;

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

    // On fait des vérifications sur les insertions avant d'insérer dans BD
    // La base de données a déjà des contraintes mais il faut éviter d'insérer et de causer une erreur SQL

    // On vérifie que dans la table classe aucun classe ne possède déjà cet email
    Classe.findOne({ attributes: ['idclasse'], where: { courriel: email } })
        .then(searchClass => {
            if (searchClass) {
                console.log("Mail existant pour la classe");
                return res.sendStatus(409)
            } else {
                Eleve.findOne({ attributes: ['ideleve'], where: { courriel: email } })
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
                                            const path = "Classes/classe" + num + "/depot"
                                            verificationChemin(path)
                                            console.log("Création de compte classe réussie, idclasse : " + num)

                                            return res.send(newclasse);
                                        })
                                        .catch(err => {
                                            console.log("erreur inscription classe : " + err)
                                            return res.send("Erreur survenue lors de l'enregistrement du compte classe.").status(520)
                                        })
                                }

                            });
                        }
                    })
                    .catch(err => {
                        console.log("erreur inscription classe eleve.findone "+err)
                        return res.send("Erreur lors de la vérification de l'unicité de l'adresse mail fournie.").status(520)
                    });
            }
        })
        .catch(err => {
            console.log("erreur inscription classe classe.findone "+err);
            return res.send("Erreur lors de la vérification de l'unicité de l'adresse mail fournie.").status(520)
        });
}


module.exports = { InscriptionClasse, InscriptionEleve };