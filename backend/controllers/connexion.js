const db = require('../utils/database');
const bcrypt = require('bcrypt');

const Connexion = (req, res) => {
    const pseudo = req.body.user;
    const mdp = req.body.pwd;
    console.log("connexion " + mdp + " " + pseudo)
    if (mdp == "" || pseudo == "") {
        res.sendStatus(402)
    }
    db.query('SELECT * FROM eleve WHERE pseudo = ? OR courriel = ?', [pseudo, pseudo], function (error, results, fields) {
        // En cas d'erreur
        if (error) throw error;
        // Si le compte existe
        if (results.length > 0) {
            bcrypt.compare(mdp, results[0].motdepasse, function (err, estValide) {
                if (estValide) {
                    console.log("Connexion de l'élève OK")
                    // si le mot de passe entré correspond bien au mot de passe dans la base de données
                    res.send(results)
                } else {
                    console.log("Mauvais mot de passe ELEVE")
                    // sinon, si ce n'est pas le bon mdp mais le bon pseudo
                    res.sendStatus(400)
                }
            });
            // Si la valeur entrée est un email, il se peut qu'il appartiennent à la classe
        } else if (pseudo.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) {
            console.log("test adr mail classe")
            db.query('SELECT * FROM classe WHERE courriel = ?', [pseudo], function (error, results, fields) {
                // En cas d'erreur
                if (error) throw error;
                if (results.length > 0) {
                    // on compare le mdp hashé de la bd avec le mdp rentré par l'utilisateur, bcrypt permet de faire la comparaison
                    bcrypt.compare(mdp, results[0].motdepasse, function (err, estValide) {
                        if (estValide) {
                            console.log("CONNEXION de la classe OK")
                            // si le mot de passe entré correspond bien au mot de passe dans la base de données
                            res.send(results)
                        } else {
                            console.log("Mauvais mot de passe CLASSE")
                            // si ce n'est pas le bon mdp mais le bon pseudo
                            res.sendStatus(400)
                        }
                    });
                } else {
                    // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
                    console.log("Utilisateur pas trouvé Classe")
                    // si pour le pseudo donné, aucun utilisateur ne correspond 
                    res.sendStatus(401);
                }
            });

        } else {
            // Sinon c'est que l'utilisateur s'est soit trompé, soit qu'il n'existe pas
            console.log("Utilisateur pas trouvé ELEVE")
            // si pour le pseudo donné, aucun utilisateur ne correspond 
            res.sendStatus(401);
        }
    });
}

module.exports = { Connexion };