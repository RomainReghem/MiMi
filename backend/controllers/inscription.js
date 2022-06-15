//const db = require('../utils/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { verificationChemin } = require("./ajoutDocument")

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
    // console.log("\n*** Inscription de l'élève ***")

    const pseudo = req.body.user;
    const prenom = req.body.firstName;
    const nom = req.body.name;
    const email = req.body.mail;
    const mdp = req.body.pwd;

    // console.log(pseudo + prenom + nom + email + mdp)
    // On revérifie la forme des informations données
    // Prenom doit etre compris entre 2 et 24 caractères de l'alphabet, y compris les accents minuscules 
    if (!(prenom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("Err controllers/inscription.js > InscriptionEleve : taille prenom pas bonne")
        return res.status(403).send("Le prénom n'est pas de la bonne taille (entre 2 et 24 lettres)")
    }
    //console.log("prenom ok")
    // Nom doit être compris entre 2 et 24 inclus et doit être composé uniquement de lettres
    if (!(nom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("Err controllers/inscription.js > InscriptionEleve : nom incorrect")
        return res.status(404).send("Le nom de famille n'est pas de la bonne taille !")
    }
    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("Err controllers/inscription.js > InscriptionEleve : pseudo pas ok")
        return res.status(405).send("Le pseudo n'est pas valide.")
    }
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("Err controllers/inscription.js > InscriptionEleve : taille mdp pas ok")
        return res.status(406).send('Le mot de passe ne respecte pas les conditions !')
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("Err controllers/inscription.js > InscriptionEleve : forme mail incorrect")
        return res.status(407).send("La forme du mail n'est pas correcte !")
    }

    // Hashage du mot de passe
    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            console.log("Err controllers/inscription.js > InscriptionEleve : hashage " + err)
            return res.status(600).send("Erreur lors du chiffrement du mot de passe.")
        }

        // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
        Eleve.findOne({ attributes: ['ideleve'], where: { courriel: email } })
            .then(searchEleve => {
                if (searchEleve) {
                    console.log("Err controllers/inscription.js > InscriptionEleve : mail pas unique");
                    return res.status(409).send("Le mail n'est pas unique, un autre élève est déjà enregistré avec ce mail.")
                }
                //console.log("mail unique pour eleves");
                Classe.findOne({ attributes: ['idclasse'], where: { courriel: email } })
                    .then(classe => {
                        if (classe) {
                            console.log("Err controllers/inscription.js > InscriptionEleve : mail existant pour la classe");
                            return res.status(410).send("Cette adresse mail est déjà utilisée par un compte classe.")
                        }
                        // console.log("inscription ok")
                        Eleve.create(({
                            pseudo: pseudo,
                            courriel: email,
                            motdepasse: hash,
                            nom: nom,
                            prenom: prenom
                        }))
                            .then(() => {
                                //console.log("Création de compte élève réussie")
                                // console.log("*** Création d'un dossier ***")
                                // enregistrement de l'avatar par défaut
                                /* let avatar = {
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
                                 avatar = JSON.stringify(avatar)*/

                                /* const path = "./Documents/" + email
                                 verificationChemin(path + "/images")*/
                                // on enregistre le fichier JSON correspondant à l'avatar de l'élève
                                /* fs.writeFile(path + "/images/avatar.json", avatar, 'utf8', function (err) {
                                     if (err) {
                                         console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
                                         return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                                     }
                                     console.log("Le fichier JSON a bien été sauvegardé");
                                     return res.status(201).send("Enregistrement effectué");
                                 });*/
                                return res.status(201).send("Vous êtes bien inscrit !")
                            })
                            .catch(err => {
                                console.log("Err controllers/inscription.js > InscriptionEleve : eleve create " + err)
                                return res.status(520).send("Erreur lors de l'enregistrement du compte élève.")
                            })
                    })
                    .catch(err => {
                        console.log("Err controllers/inscription.js > InscriptionEleve : erreur lors de la recherche de classe \n" + err)
                        return res.status(520).send("Erreur serveur sur la vérification de la validité de l'adresse mail.")
                    });
            }).catch(err => {
                console.log("Err controllers/inscription.js > InscriptionEleve : erreur lors de la recherche d'eleve avec la meme adresse \n" + err)
                return res.status(520).send("Erreur serveur sur la vérification de la validité de l'adresse mail.")
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
    console.log('\n*** Inscription de la classe ***')
    const email = req.body.mail;
    const mdp = req.body.pwd;

    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
        console.log("Err controllers/inscription.js > InscriptionClasse : taille mdp pas ok")
        return res.status(406).send('Le mot de passe ne respecte pas les conditions !')
    }

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("Err controllers/inscription.js > InscriptionClasse : forme mail incorrect")
        return res.status(407).send("La forme du mail n'est pas correcte !")
    }

    // On fait des vérifications sur les insertions avant d'insérer dans BD
    // La base de données a déjà des contraintes mais il faut éviter d'insérer et de causer une erreur SQL

    // On vérifie que dans la table classe aucun classe ne possède déjà cet email
    Classe.findOne({ attributes: ['idclasse'], where: { courriel: email } })
        .then(searchClass => {
            if (searchClass) {
                console.log("Err controllers/inscription.js > InscriptionClasse : Mail existant pour la classe");
                return res.status(409).send("Le mail n'est pas unique, une autre classe est déjà enregistrée avec ce mail.")
            } else {
                Eleve.findOne({ attributes: ['ideleve'], where: { courriel: email } })
                    .then(eleve => {
                        if (eleve) {
                            console.log("Err controllers/inscription.js > InscriptionClasse : Mail existant pour un eleve");
                            return res.status(411).send("Ce mail n'est pas unique, un élève est enregistré avec ce mail.")
                        } else {
                            // Hashage du mot de passe
                            bcrypt.hash(mdp, 10, (err, hash) => {
                                if (err) {
                                    console.log("Err controllers/inscription.js > InscriptionClasse : hashage mdp classe" + err)
                                    return res.status(600).send("Erreur lors de la sauvegarde du mot de passe.")
                                } else {
                                    Classe.create(({
                                        courriel: email,
                                        motdepasse: hash
                                    }))
                                        .then(() => {
                                            const path = "./Documents/" + email;
                                            try {
                                                verificationChemin(path);
                                                //console.log("Création de compte classe réussie")
                                                return res.status(201).send("Inscription réussie !");
                                            } catch (error) {
                                                console.log("Err controllers/inscription.js > InscriptionClasse : verif chemin")
                                                return res.status(520).send(error);

                                            }
                                        })
                                        .catch(err => {
                                            console.log("Err controllers/inscription.js > InscriptionClasse : classe create " + err)
                                            return res.status(520).send("Erreur survenue lors de l'enregistrement du compte classe.");
                                        })
                                }

                            });
                        }
                    })
                    .catch(err => {
                        console.log("Err controllers/inscription.js > InscriptionClasse : eleve.findone " + err)
                        return res.status(520).send("Erreur lors de la vérification de l'unicité de l'adresse mail fournie.")
                    });
            }
        })
        .catch(err => {
            console.log("eErr controllers/inscription.js > InscriptionClasse : classe.findone " + err);
            return res.status(520).send("Erreur lors de la vérification de l'unicité de l'adresse mail fournie.")
        });
}


module.exports = { InscriptionClasse, InscriptionEleve };