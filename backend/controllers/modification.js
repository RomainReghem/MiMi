const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;
const bcrypt = require('bcrypt');

const ChangementMdp = (req, res) => {
    const email = req.body.mail;
    const mdp = req.body.pwd;
    const newMdp = req.body.newPwd;
    console.log("*** Vérification mot de passe ***")
    if (!(mdp.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$"))) {
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
                        // on change le mdp
                        const neweleve = Eleve.update(
                            {
                                motdepasse: newMdp,
                            },
                            {
                                where: { courriel: email },
                            }
                        );
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
                                const newclasse = Classe.update(
                                    {
                                        motdepasse: newMdp,
                                    },
                                    {
                                        where: { courriel: email },
                                    }
                                );
                                // on envoie la nouvelle classe 
                                res.send(newclasse)
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
    res.sendStatus(404)
}

module.exports = { ChangementMdp, ChangementMail }