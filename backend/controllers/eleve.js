// pour l'accès aux documents
const fs = require('fs');
const { Eleve, Classe } = require('../models/users');

//var generator = require('generate-password')


/**
 * Renvoie au client le pseudo de l'élève en fonction de son adresse mail.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur
 */
const getUsernameStudent = (req, res) => {
    //console.log("\n*** Récupération du pseudo ***")
    const email = req.query.mail

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peut récupèrer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['pseudo'],
            where: {
                courriel: email
            }
        }).then(eleve => {
            if (eleve) {
                //console.log('pseudo ' + eleve.pseudo)
                return res.status(201).json({ pseudo: eleve.pseudo })
            } else {
                console.log("Err controllers/eleve.js > getUsernameStudent : pas d'eleve trouve avec mail %s", email)
                return res.status(409).send("Aucun élève avec cette adresse")
            }
        })
            .catch(err => {
                console.log("Err controllers/eleve.js > getUsernameStudent : eleve findone" + err)
                return res.status(520).send("Erreur lors de la récupération du pseudo")
            });
    } else {
        console.log("Err controllers/eleve.js > getUsernameStudent : role %s ou email %s du token invalide ", role, emailToken)
        return res.status(403).send("Pas un élève / pas le bon élève")
    }
}


// /**
//  * Renvoie au client le nom et prénom de l'élève en fonction de son adresse mail.
//  * 
//  * @param {*} req la requête du client, contient le mail de l'élève
//  * @param {*} res la réponse du serveur
//  */
// const getNameStudent = (req, res) => {
//     console.log("\n*** Récupération du nom et du prénom de l'élève ***")
//     const email = req.query.mail

//     if (email == undefined) {
//         return res.status(404).send("Pas de mail")
//     }
//     if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
//         return res.status(400).send("Mail incorrect")
//     }

//     const role = req.role;
//     const emailToken = req.mail
//     // pas d'autre utilisateur que l'élève ne peut récupèrer son propre pseudo
//     if (role == "eleve" && emailToken == email) {
//         Eleve.findOne({
//             attributes: ['prenom', 'nom'],
//             where: {
//                 courriel: email
//             }
//         }).then(eleve => {
//             if (eleve) {
//                 console.log('prenom %s et nom %s ', eleve.prenom, eleve.nom)
//                 return res.status(200).json({ nom: eleve.nom, prenom: eleve.prenom })
//             } else {
//                 return res.status(409).send("Aucun élève avec cette adresse")
//             }
//         })
//             .catch(err => {
//                 console.log(err)
//                 return res.status(520).send(err)
//             });
//     } else {
//         return res.status(403).send("Pas un élève / pas le bon élève")
//     }
// }


/**
 * Supprime l'élève en fonction de son mail.
 * Supprime aussi tous ses documents.
 * Supprime aussi ses scores aux jeux
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const deleteStudent = (req, res) => {
    //console.log('\n*** Suppression de compte élève ***')
    const email = req.body.mail

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peuvent se supprimer
    if (role == "eleve" && emailToken == email) {
        // on cherche dans la bd l'eleve qui correspond au mail fourni
        Eleve.findOne({
            attributes: ['ideleve'],
            where: { courriel: email }
        })
            .then(eleve => {
                // si aucun élève n'a été trouvé
                if (!eleve) {
                    console.log("Err controllers/eleve.js > deleteStudent : pas d'eleve trouve avec l'adresse %s", email)
                    return res.status(404).send("Pas d'élève trouvé avec cet adresse mail.");
                }
                // sinon on supprime l'élève
                Eleve.destroy({
                    where: {
                        ideleve: eleve.ideleve
                    }
                }).then(() => {
                    // maintenant on doit supprimer les dossiers et les documents de l'élève
                    const path = "./Documents/" + email
                    // supprime le dossier du chemin donné, ainsi que tout ce qui se trouve à l'intérieur
                    fs.rm(path, { recursive: true }, (err) => {
                        if (err) {
                            console.log("Err controllers/eleve.js > deleteStudent : erreur suppression dossiers : " + err)
                            return res.status(500).send("Erreur lors de la suppression des documents.")
                        }
                        // console.log("Suppression effectuée !")
                        return res.status(205).send("Suppression de l'élève effectuée !");
                    })
                }).catch(err => {
                    console.log("Err controllers/eleve.js > deleteStudent : eleve destroy " + err)
                    return res.status(520).send("Erreur survenue lors de la suppression du compte.");
                });
            })
            .catch(err => {
                console.log("Err controllers/eleve.js > deleteStudent : erreur eleve findone " + err)
                return res.status(520).send("Erreur lors de la récupération des données du compte à supprimer.")
            });
    } else {
        console.log("Err controllers/eleve.js > deleteStudent : role %s ou email %s du token invalide ", role, emailToken)
        return res.status(403).send("Pas un élève / pas le bon élève")
    }
}


/*const resetPassword=(req, res)=>{
    const email=req.body.email;
    // on va génèrer un mot de passe temporaire
    const pwd=generator.generate({
        length:24,
        numbers:true,
        symbols:"!@#$%",
        lowercase:true,
        uppercase:true,
        strict:true
    })
    // on insère dans la base de données ce mot de
}*/


/**
 * Retourne l'invitation, l'id et l'email de la classe associée à l'invitation dans un format JSON
 * 
 * @param {String} emailEleve l'email de l'èleve dont on veut l'invitation
 */
function getInvitation(emailEleve, cb) {
    //console.log("\n***Récupération d'invitation.***")
    // console.log("eleve.js => getInvitation")
    // on vérifie que le mail soit bien présent
    if (!emailEleve) {
        console.log("Err controllers/eleve.js > getInvitation : adresse mail manquante pour la recuperation d'invitation ")
        return cb(400);
    }
    if (!(emailEleve.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailEleve.length) {
        console.log("Err controllers/eleve.js > getInvitation : forme mail incorrect")
        return cb(400)
    }

    Eleve.findOne({
        attributes: ['invitation', 'idclasse'],
        where: { courriel: emailEleve }
    })
        .then(eleve => {
            // si aucun élève n'a été trouvé
            if (!eleve) {
                console.log("Err controllers/eleve.js > getInvitation : aucun eleve trouvé avec l'adresse %s", emailEleve)
                return cb(404)
            }
            const invitation = eleve.invitation;
            if (invitation != "aucune") {
                Classe.findOne({ attributes: ["idclasse", "courriel"], where: { idclasse: eleve.idclasse } })
                    .then(classe => {
                        if (!classe) {
                            console.log(`Err controllers/eleve.js > getInvitation : aucun eleve trouvé avec l'id ${eleve.idclasse}`)
                            return cb(404);
                        }
                        // console.log("invitation envoyée avec l'id de la classe, ainsi que le mail de la classe")
                        return cb({ invitation: invitation, idclasse: classe.idclasse, mailClasse: classe.courriel })
                    })
                    .catch(err => {
                        console.log(`Err controllers/eleve.js > getInvitation : classe findone ${err}`)
                        return cb(520)
                    });
            } else {
                //console.log("aucune invitation en attente ou acceptee")
                return cb({ invitation: invitation })
            }
        })
        .catch(err => {
            console.log(`Err controllers/eleve.js > getInvitation : eleve findone ${err}`)
            return cb(520)
        });
}


module.exports = {
    getUsernameStudent,
    deleteStudent,
    getInvitation
}
