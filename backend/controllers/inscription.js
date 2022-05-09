//const db = require('../utils/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require("path")

const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;

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
        res.sendStatus(403)
    }
    //console.log("prenom ok")
    // Nom doit être compris entre 1 et 44 inclus 
    if (!(nom.match("^[A-z-àâçéèêëîïôûùüÿñ]{2,24}$"))) {
        console.log("nom incorrect")
        res.sendStatus(404)
    }
    //console.log("nom ok")

    if (!(pseudo.match("^[A-z0-9-_]{3,24}$"))) {
        console.log("pseudo pas ok")
        res.sendStatus(405)
    }
    //console.log("pseudo ok")

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
                                                .then(() => {
                                                    console.log("Création de compte élève")
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
    // La base de données a déjà des contraintes
    // Verification d'unicité du pseudo 

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
                                            console.log("*** Création d'un dossier ***")
                                            //const path ="./test/classe" + num + "/avatar"
                                            //const path = __dirname+"\\test\\classe" + num + "\\avatar"
                                            //console.log(path)
                                            /* fs.access(path.join(__dirname, "test/classe" + num + "/avatar"), (err) => {
                                                 if (err) {*/
                                        /*    if (!fs.existsSync(__dirname, "../testclasse")) {
                                                // ça veut dire qu'aucun dossier n'existe
                                                // on crée donc le dossier
                                                fs.mkdirSync(path.join(__dirname, "../testclasse","classe" + num, "avatar" ), (err) => {
                                                    if (err) {
                                                        console.log("Erreur lors de la création de dossier test " + err)
                                                        return res.status(600).send("Erreur lors de la création de dossier")
                                                    }

                                                },{recursive:true})

                                            }else
                                            if (!fs.existsSync(__dirname + "../testclasse", "classe" + num)) {
                                                console.log("YO")
                                                fs.mkdirSync(path.join(__dirname, "../testclasse/classe" + num, "avatar"), (err) => {
                                                    console.log("Erreur lors de la création de dossier test " + err)
                                                    return res.status(600).send("Erreur lors de la création de dossier")
                                                }, {recursive:true})
                                            }else if(!fs.existsSync(__dirname + "../testclasse/classe"+num, "avatar")){
                                                fs.mkdirSync(path.join(__dirname, "../testclasse/classe" + num, "avatar"), (err) => {
                                                    console.log("Erreur lors de la création de dossier test " + err)
                                                    return res.status(600).send("Erreur lors de la création de dossier")
                                                }, {recursive:true})
                                            }*/
                                            console.log("dossier crée")
                                            return res.send(newclasse);
                                            /*  }
                                          })*/
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