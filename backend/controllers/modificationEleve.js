const Users = require('../models/users');
const Eleve = Users.Eleve;

const Modification = require('../controllers/modification.js')


/**
 * Change le pseudo de l'élève dans la base de données.
 * Utilise l'email, l'ancien pseudo et le mot de passe donnés par le client.
 * Vérifie la validité des informations et le fait que le pseudo soit unique.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const ChangementPseudo = (req, res) => {
    console.log("\n*** Changement du pseudo ***")
    const email = req.body.mail;
    const pseudo = req.body.newPseudo;
    console.log("email " + email + " new " + pseudo)

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
            .catch(err=>{
                console.log(err)
                return res.send(err).status(520)
            });
    }
}

/**
 * Change la valeur d'invitation à aucune et l'id de classe à null
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const SuppressionClasse = (req, res) => {
    console.log("\n*** Suppression de classe d'un élève ***")
    const email = req.body.user;
    console.log("ok "+req.body)
    Modification.setInvitation("aucune", email, "", function(code){
        console.log("Code "+code)
        if (code == 201) {
            return res.status(201).send("Suppression de classe réussie !")
        }
        return res.status(code).send("Erreur")
    })
}

/**
 * Change la valeur d'invitation à acceptee et l'id de classe à l'id de la classe dont on reçoit le mail
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const AcceptationInvitation = (req, res) => {
    console.log("\n*** Acceptation de l'invitation d'une classe ***")
    const email = req.body.user;
    /// RECUP MAIL CLASSE 
    Eleve.findOne({where:{ courriel: email }})
        .then(eleve => {
            if (!eleve) {
                return res.sendStatus(404)
            }
            Users.Classe.findOne({where:{ idclasse: eleve.idclasse }})
                .then(classe => {
                    if (!classe) {
                        return res.sendStatus(404)
                    }
                    Modification.setInvitation("acceptee", email, classe.courriel, function(code){
                        if (code == 201) {
                            return res.status(201).send("Acceptation de la classe réussie !")
                        }
                        return res.status(code).send("Erreur")
                    })
                }
                )
        })
        .catch(err=>{
            console.log(err)
            return res.send(err).status(520)
        });

}

module.exports = { ChangementPseudo, SuppressionClasse, AcceptationInvitation }