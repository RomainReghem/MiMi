const Eleve = require('../models/users').Eleve
const Classe = require('../models/users').Classe

const fs = require('fs');


/**
 * Supprime le cours d'un élève avec le nom donné
 * @param {*} req la requête du client, doit contenir l'email de l'élève, le nom du cours et le nom de la matière
 * @param {*} res la réponse du serveur
 */
const deleteCoursEleve = (req, res) => {
    console.log("\n*** Suppression de cours de l'eleve ***")
    const email = req.body.mail;
    const cours = req.body.cours;
    const matiere = "maths"//req.body.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut supprimer un fichier ici, celui à qui appartient les cours
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['ideleve'],
            where: { courriel: email }
        })
            .then(eleve => {
                if (!eleve) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Élève inexistant");
                }
                const num = eleve.ideleve;
                let path = "./Eleves/eleve" + num + "/depot/" + matiere + "/" + cours;

                const code = deleteCours(path)
                if (code == 201) {
                    return res.status(code).send("suppression réussie")
                }
                return res.status(code)

            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas un eleve, soit pas le bon eleve : accès interdit')
        return res.status(403).send("Tentative de suppression de cours d'un autre utilisateur")
    }
}


/**
 * Supprime le cours d'une classe avec le nom donné
* @param {*} req la requête du client, doit contenir l'email de la classe, le nom du cours et le nom de la matière
* @param {*} res la réponse du serveur
*/
const deleteCoursClasse = (req, res) => {
    console.log("\n*** Suppression de cours de la classe ***")

    const id = req.body.id;
    const cours = req.body.cours;
    const matiere = "maths"//req.body.matiere;

    const role = req.role;
    const emailToken = req.mail
    // seule une classe peut supprimer un fichier ici, celle à qui appartient les cours
    if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse', 'courriel'],
            where: { idclasse: id }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("classe inexistante");
                }
                if (emailToken != classe.courriel) {
                    return res.status(403).send("Tentative de suppression de cours d'un autre utilisateur")
                }
                let path = "./Classes/classe" + id + "/depot/" + matiere + "/" + cours;

                const code = deleteCours(path)
                console.log("code http : " + code)
                if (code == 201) {
                    return res.status(code).send("suppression réussie")
                }
                return res.status(code)
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas une classe, soit pas la bonne classe : accès interdit')
        return res.status(403).send("Tentative de suppression de cours d'un autre utilisateur")
    }
}


/**
 * Supprime un document en fonction du chemin donné.
 * @param {String} path le chemin du document à supprimer
 * @returns un code http associé à une erreur ou un succès
 */
function deleteCours(path) {
    try {
        // on vérifie que le cours existe bien 
        if (fs.existsSync(path)) {
            // s'il existe alors on peut le supprimer
            try {
                fs.unlinkSync(path)
                console.log("suppression de cours ok ")
                return 201;
            } catch (err) {
                console.error(err)
                return 520
            }
            // sinon le cours n'a pas été trouvé
        } else {
            console.log("Pas de document dans le chemin " + path + ".");
            return 404;
        }

    } catch (err) {
        console.error("Erreur lors de la vérification des dossiers" + err)
        return 520;
    }
}


const deleteAllCoursClasse = (req, res) => {
    console.log("\n*** Suppression des cours de la classe ***")
    const id = req.body.id;
    const matiere = "maths"//req.body.matiere;

    const role = req.role;
    const emailToken = req.mail
    // seule une classe peut supprimer un dossier ici, celle à qui appartient les cours
    if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse', 'courriel'],
            where: { idclasse: id }
        })
            .then(classe => {
                if (!classe) {
                    //console.log("Utilisateur pas trouvé");
                    return res.status(404).send("classe inexistante");
                }
                if (emailToken != classe.courriel) {
                    return res.status(403).send("Tentative de suppression de cours d'un autre utilisateur")
                }
                let path = "./Classes/classe" + id + "/depot/" + matiere;

                deleteMatiere(path, function (code) {
                    if (code == 201) {
                        return res.status(code).send("suppression réussie")
                    }
                    return res.status(code)
                })
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas une classe, soit pas la bonne classe : accès interdit')
        return res.status(403).send("Tentative de suppression de matiere d'un autre utilisateur")
    }
}


/**
 * Supprime des dossiers de l'élève la matière donnée avec tous les cours contenus dedans
 * @param {*} req la requête du client, doit contenir l'email de l'élève et le nom de la matière à supprimer.
 * @param {*} res la réponse du serveur
 */
const deleteAllCoursEleve = (req, res) => {
    console.log("\n*** Suppression de tous les cours de l'eleve ***")
    const email = req.body.mail;
    const matiere = "maths"// req.body.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut supprimer un dossier ici, celui à qui appartient les cours
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['ideleve'],
            where: { courriel: email }
        })
            .then(eleve => {
                if (!eleve) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Élève inexistant");
                }
                const num = eleve.ideleve;
                let path = "./Eleves/eleve" + num + "/depot/" + matiere;

                deleteMatiere(path, function (code) {
                    if (code == 201) {
                        return res.status(code).send("suppression réussie")
                    }
                    return res.status(code)
                })
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas un eleve, soit pas le bon eleve : accès interdit')
        return res.status(403).send("Tentative de suppression de matiere d'un autre utilisateur")
    }
}

/**
 * Supprimer un repértoire en fonction du chemin donné.
 * @param {String} path le chemin du dossier à supprimer
 * @returns un code http associé à une erreur ou un succès
 */
function deleteMatiere(path, cb) {
    try {
        // on vérifie que la matière existe bien 
        if (fs.existsSync(path)) {
            try {
                fs.rmdirSync(path, { recursive: true });
                console.log("suprresion de la matière " + path + " ok ")
                return cb(201);
            } catch (err) {
                console.error(err)
                return cb(520);
            }
            // sinon la matière n'a pas été trouvée
        } else {
            console.log("Pas de matière dans le chemin " + path + ".");
            return cb(404);
        }

    } catch (err) {
        console.error("Erreur lors de la vérification des dossiers" + err)
        return cb(520);
    }
}


module.exports = { deleteCoursEleve, deleteAllCoursEleve, deleteCoursClasse, deleteAllCoursClasse }