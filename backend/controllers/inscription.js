const db = require('../utils/database');
const bcrypt = require('bcrypt');

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
        // On fait des vérifications sur les insertions avant d'insérer dans BD
        // La base de données a déjà des contraintes
        // Verification d'unicité du pseudo 
        db.query('SELECT * FROM eleve WHERE pseudo = ?', [pseudo], (error, results) => {
            if (results.length > 0) {
                console.log("Pseudo pas unique");
                res.sendStatus(408)
            } else {
                console.log("pseudo valide")
                // On vérifie que dans la table ELEVE aucun élève ne possède déjà cet email
                db.query('SELECT * FROM eleve WHERE courriel = ?', [email], (error, results) => {
                    if (results.length > 0) {
                        console.log("Mail pas unique");
                        res.sendStatus(409)
                    } else {
                        console.log("Mail unique parmi les élèves")
                        //  On vérifie que l'email n'est pas possèdé par une classe 
                        db.query('SELECT * FROM classe WHERE courriel = ?', [email], (error, results) => {
                            if (results.length > 0) {
                                console.log("Mail existant pour la classe");
                                res.sendStatus(410)
                            } else {
                                console.log("mdp" + hash)
                                console.log("Mail valide (unique dans la bd)");
                                db.query("INSERT INTO eleve(pseudo, prenom, nom, courriel, motdepasse) VALUES (?, ?, ?, ?, ?)", [pseudo, prenom, nom, email, hash],
                                    function (error, results, fields) {
                                        if (error) {
                                            /*if (error.sqlState == '50001') {
                                                console.log("mail existant dans classe ");
                                            } else {
                                                console.log(error)
                                            }*/
                                            console.log(error)
                                        } else {
                                            console.log("création de compte réussie")
                                            res.send(results)
                                        }
                                    }
                                );
                            }
                        }
                        );
                    }
                }
                );
            }
        }
        );
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


    // Hashage du mot de passe
    bcrypt.hash(mdp, 10, (err, hash) => {
        if (err) {
            console.log(err)
        }
        // On fait des vérifications sur les insertions avant d'insérer dans BD
        // La base de données a déjà des contraintes
        // Verification d'unicité du pseudo 

        // On vérifie que dans la table classe aucun classe ne possède déjà cet email
        db.query('SELECT * FROM classe WHERE courriel = ?', [email], (error, results) => {
            if (results.length > 0) {
                console.log("Mail pas unique");
                res.sendStatus(409)
            } else {
                console.log("Mail unique parmi les classes")
                //  On vérifie que l'email n'est pas possèdé par une classe 
                db.query('SELECT * FROM eleve WHERE courriel = ?', [email], (error, results) => {
                    if (results.length > 0) {
                        console.log("Mail existant pour un eleve");
                        res.sendStatus(411)
                    } else {
                        console.log("mdp" + hash)
                        console.log("Mail valide (unique dans la bd)");
                        db.query("INSERT INTO classe(courriel, motdepasse) VALUES (?, ?)", [email, hash],
                            function (error, results, fields) {
                                if (error) {
                                    /*if (error.sqlState == '50001') {
                                        console.log("mail existant dans classe ");
                                    } else {
                                        console.log(error)
                                    }*/
                                    console.log(error)
                                } else {
                                    console.log("création de compte réussie")
                                    res.send(results)
                                }
                            }
                        );
                    }
                }
                );
            }
        }
        );
    });
}

module.exports = { InscriptionClasse, InscriptionEleve };