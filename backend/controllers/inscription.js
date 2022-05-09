//const db = require('../utils/database');
const bcrypt = require('bcrypt');

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
        // On fait des vérifications sur les insertions avant d'insérer dans BD
        // La base de données a déjà des contraintes
        // Verification d'unicité du pseudo 
        // db.query('SELECT * FROM eleve WHERE pseudo = ?', [pseudo], (error, results) => {
        //     if (results.length > 0) {
        //         console.log("Pseudo pas unique");
        //         res.sendStatus(408)
        //     } else {
        //         console.log("pseudo valide")
        //         // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
        //         db.query('SELECT * FROM eleve WHERE courriel = ?', [email], (error, results) => {
        //             if (results.length > 0) {
        //                 console.log("Mail pas unique");
        //                 res.sendStatus(409)
        //             } else {
        //                 console.log("Mail unique parmi les élèves")
        //                 //  On vérifie que l'email n'est pas possèdé par une classe 
        //                 db.query('SELECT * FROM classe WHERE courriel = ?', [email], (error, results) => {
        //                     if (results.length > 0) {
        //                         console.log("Mail existant pour la classe");
        //                         res.sendStatus(410)
        //                     } else {
        //                         console.log("mdp" + hash)
        //                         console.log("Mail valide (unique dans la bd)");
        //                         db.query("INSERT INTO eleve(pseudo, prenom, nom, courriel, motdepasse) VALUES (?, ?, ?, ?, ?)", [pseudo, prenom, nom, email, hash],
        //                             function (error, results, fields) {
        //                                 if (error) {
        //                                     /*if (error.sqlState == '50001') {
        //                                         console.log("mail existant dans classe ");
        //                                     } else {
        //                                         console.log(error)
        //                                     }*/
        //                                     console.log(error)
        //                                 } else {
        //                                     console.log("création de compte réussie")
        //                                     res.send(results)
        //                                 }
        //                             }
        //                         );
        //                     }
        //                 }
        //                 );
        //             }
        //         }
        //         );
        //     }
        // }
        // );
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
            res.sendStatus(409)
        } else {
            Eleve.findOne({ where: { courriel: email } })
                .then(eleve => {
                    if (eleve) {
                        console.log("Mail existant pour un eleve");
                        res.sendStatus(411)
                    } else {
                        // Hashage du mot de passe
                        bcrypt.hash(mdp, 10, (err, hash) => {
                            if (err) {
                                console.log("erreur hashage mdp classe" + err)
                            } else {
                                const newclasse = Classe.create(({
                                    courriel: email,
                                    motdepasse: hash
                                }))
                                    .then(() => {
                                        console.log("Création de compte classe réussie")
                                        res.send(newclasse);
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