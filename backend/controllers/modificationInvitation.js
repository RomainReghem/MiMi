const Users = require('../models/users');
const Eleve = Users.Eleve;
const Classe = Users.Classe;


/**
 * Change l'invitation de l'élève 
 * @param {*} invitation le statut de l'invitation d'une classe à l'élève
 * @param {*} emailEleve le mail de l'élève dont on veut changer le statut d'invitation
 * @param {*} emailClass le mail de la classe qui a donné l'invitation (s'il y en a une)
 * @returns un nombre correspond au code http à renvoyer 
 */
function setInvitation(invitation, emailEleve, emailClass, callback) {
   // console.log("\n*** Changement d'invitation ***")
   // console.log("invitation " + invitation + " eleve " + emailEleve + " classe " + emailClass)
    // vérification du mail
    if (!(emailEleve.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailEleve.length) {
        console.log("Err controllers/modificationInvitation.js > setInvitation : forme mail incorrecte")
        return callback(400)
    }
    // vérification de l'invitation (n'a que 3 valeurs possible)
    if (invitation != "aucune" && invitation != "en attente" && invitation != "acceptee") {
        console.log("Err controllers/modificationInvitation.js > setInvitation : forme invitation incorrecte")
        return callback(400)
    }
    let emailClasse = "";
    // if invitation isn't set to aucune, then the request body has to contain the mail of the class
    if (invitation != "aucune") {
        emailClasse = emailClass
    }
    // on cherche dans la bd l'eleve qui correspond au mail fourni
    Eleve.findOne({ where: { courriel: emailEleve } })
        .then(eleve => {
            if (!eleve) {
                console.log("Err controllers/modificationInvitation.js > setInvitation : aucun élève trouvé avec cette adresse.");
                return callback(404);
            }
            if (emailClasse == "") {
                // pas d'invitation : suppression des valeurs antérieures
                Eleve.update(
                    {
                        idclasse: null,
                        invitation: "aucune"
                    },
                    {
                        where: { ideleve: eleve.ideleve },
                    }
                ).then(newEleve => {
                    // Modification de l'invitation effectuée !
                    return callback(201);
                })
                .catch(err=>{
                    console.log("Err controllers/modificationInvitation.js > setInvitation : eleve update : "+err)
                    return callback(520)
                })
            } else {
                // console.log("invitation : changement/ajout de l'id de la classe")
                if (eleve.invitation != "aucune" && invitation == "en attente") {
                    console.log("Err controllers/modificationInvitation.js > setInvitation : l'élève est dans une classe ou a une demande en attente")
                    return callback(403)
                }
                if ((invitation == "acceptee" && eleve.invitation != "en attente")) {
                    console.log("Err controllers/modificationInvitation.js > setInvitation : invitation impossible : l'élève n'a pas de demande en attente")
                    return callback(409)
                }
                Classe.findOne({ where: { courriel: emailClasse } })
                    .then(classe => {
                        if (!classe) {
                            console.log("Err controllers/modificationInvitation.js > setInvitation : aucune classe trouvée avec l'adresse mail %s",emailClasse)
                            return callback(404);
                        }
                        Eleve.update(
                            {
                                idclasse: classe.idclasse,
                                invitation: invitation
                            },
                            {
                                where: { ideleve: eleve.ideleve },
                            }
                        ).then(newEleve => {
                            console.log("Err controllers/modificationInvitation.js > setInvitation : modification de l'invitation effectuée !")
                            return callback(201);
                        });
                    })
                    .catch(err=>{
                        console.log("Err controllers/modificationInvitation.js > setInvitation : classe findone "+err)
                        return callback(520)
                    })
            }
        })
        .catch(err=>{
            console.log("Err controllers/modificationInvitation.js > setInvitation : eleve findone "+err)
            return callback(520)
        })
}

module.exports = { setInvitation }