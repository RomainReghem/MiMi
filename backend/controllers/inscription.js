//const db = require('../utils/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require("path")

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
    console.log("***\n Inscription de l'élève ***")
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
            return res.status(600)
        }

        // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
        Eleve.findOne({ where: { courriel: email } })
            .then(eleve => {
                if (eleve) {
                    console.log("Mail pas unique");
                    return res.sendStatus(409)
                } else {
                    console.log("mail unique pour eleves");
                    Classe.findOne({ where: { courriel: email } })
                        .then(classe => {
                            if (classe) {
                                console.log("Mail existant pour la classe");
                                return res.sendStatus(410)
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
                                            shirtColor: "#6BD9E9",
                                            shirtStyle: "polo"
                                        }
                                        // avatar=JSON.parse(avatar)
                                        //  console.log("\n2."+avatar)
                                        avatar = JSON.stringify(avatar)
                                        /*console.log("dossiers créés")
                                        console.log("enregistrement d'un avatar")
                                        fs.writeFile(path + "/avatar" + num + ".json", avatar, 'utf8', function (err) {
                                        if (err) {
                                            console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
                                            return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                                        }
                                        console.log("Le fichier JSON a bien été sauvegardé");
                                        //res.status(201).send("Enregistrement effectué");
                                                                                            });
                                        */
                                        bucket.file(path + "/avatar" + num + ".json").save(avatar, function (err) {
                                            if (err) {
                                                return res.status(600).send("Erreur lors de la sauvegarde de l'avatar.")
                                            }
                                            console.log("Le fichier JSON a bien été sauvegardé");
                                            return res.status(201).send("Enregistrement effectué");
                                        })

                                        //return res.send(neweleve);
                                    })
                                    .catch(err => {
                                        console.log("erreur inscription eleve : " + err)
                                    })
                            }
                        }
                        )


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
    console.log('\n*** Inscription de la classe ***')
    const email = req.body.mail;
    const mdp = req.body.pwd;

    //console.log(email + mdp)

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