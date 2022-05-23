const Eleve = require('../models/users').Eleve
const Classe = require('../models/users').Classe

const fs = require('fs');

/**
 * Renomme le cours d'un élève avec le nouveau nom donné
 * @param {*} req la requête du client, doit contenir l'email de l'élève, l'ancien nom du cours et le nouveau nom, ainsi que la matière du cours.
 * @param {*} res la réponse du serveur
 */
const renameCoursEleve = (req, res) => {
    console.log("\n*** Changement de nom de cours ***")

    const email = req.body.mail;
    const nouvCours = req.body.newcours;
    const ancienCours = req.body.oldcours;
    const matiere = req.body.matiere;

    if (100 <= email.length || !(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"))) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut renommer un fichier ici, celui à qui appartient les cours
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
                let path = "./Eleves/eleve" + num + "/depot/" + matiere + "/";
                try {
                    // on vérifie que l'ancien cours existe bien 
                    if (fs.existsSync(path + ancienCours)) {
                        // s'il existe alors on peut le renommer
                        // mais d'abord on vérifie 
                        fs.renameSync(path + ancienCours, path + nouvCours);
                        return res.status(201);
                        // sinon le cours n'a pas été trouvé
                    } else {
                        console.log("Cours inexistant");
                        return res.status(404).send("Pas de cours portant le nom " + ancienCours + " trouvé.");
                    }

                } catch (err) {
                    console.error(err)
                    return res.status(520).send("Erreur lors de la vérification des dossiers")
                }

            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas un eleve, soit pas le bon eleve : accès interdit')
        return res.status(403).send("Tentative de renommage de cours d'un autre utilisateur")
    }
}

/**
 * Renomme une matière d'un élève avec le nouveau nom donné
 * @param {*} req la requête du client, doit contenir l'email de l'élève, l'ancien nom de la matière et le nouveau nom.
 * @param {*} res la réponse du serveur
 */
const renameMatiereEleve = (req, res) => {
    console.log("\n*** Changement de nom de matière ***")

    const email = req.body.mail;
    const nouvMatiere = req.body.newmatiere;
    const ancienneMatiere = req.body.oldmatiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }

    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut renommer un document ici, celui à qui appartient les cours
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
                let path = "./Eleves/eleve" + num + "/depot/";
                /* try {
                     // on vérifie que l'ancien cours existe bien 
                     if (fs.existsSync(path + ancienneMatiere)) {
                         // s'il existe alors on peut le renommer
                         fs.renameSync(path + ancienneMatiere, path + nouvMatiere);
                         console.log("renommage de la matière " + ancienneMatiere + " en " + nouvMatiere + " effectuee")
                         return res.status(201);
                         // sinon le cours n'a pas été trouvé
                     } else {
                         console.log("Cours inexistant");
                         return res.status(404).send("Pas de matière portant le nom " + ancienneMatiere + " trouvée.");
                     }
     
                 } catch (err) {
                     console.error(err)
                     return res.status(520).send("Erreur lors de la vérification des dossiers")
                 }*/
                renameDoc(path, ancienneMatiere, nouvMatiere, function (code) {
                    return res.status(code)
                })
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas un eleve, soit pas le bon eleve : accès interdit')
        return res.status(403).send("Tentative de renommage de cours d'un autre utilisateur")
    }
}


/**
 * Renomme une matière d'un élève avec le nouveau nom donné
 * @param {*} req la requête du client, doit contenir l'email de l'élève, l'ancien nom de la matière et le nouveau nom.
 * @param {*} res la réponse du serveur
 */
const renameCoursClasse = (req, res) => {
    console.log("\n*** Changement de nom de matière ***")
    //const id=req.body.id;
    const id = req.body.id;
    const nouvCours = req.body.newcours;
    const ancienCours = req.body.oldcours;
    const matiere = req.body.matiere;

    const role = req.role;
    const emailToken = req.mail
    // seule une classe peut renommer un dossier ici, celle à qui appartient les cours
    if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse', 'courriel'],
            where: { idclasse: id }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Élève inexistant");
                }
                if (emailToken != classe.courriel) {
                    return res.status(403).send("Tentative de renommage de cours d'un autre utilisateur")
                }
                let path = "./Classe/classe" + id + "/depot/" + matiere + "/";

                renameDoc(path, ancienCours, nouvCours, function (code) {
                    return res.status(code)
                })
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas une classe, soit pas la bonne classe : accès interdit')
        return res.status(403).send("Tentative de renommage de cours d'un autre utilisateur")
    }
}


/**
 * Renomme une matière d'une classe avec le nouveau nom donné
 * @param {*} req la requête du client, doit contenir l'email de la classe, l'ancien nom de la matière et le nouveau nom.
 * @param {*} res la réponse du serveur
 */
const renameMatiereClasse = (req, res) => {
    console.log("\n*** Changement de nom de matière d'une classe ***")

    const id = req.body.id;
    const nouvMatiere = req.body.newmatiere;
    const ancienneMatiere = req.body.oldmatiere;

    const role = req.role;
    const emailToken = req.mail
    // seule une classe peut renommer un dossier ici, celle à qui appartient les cours
    if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse', 'courriel'],
            where: { idclasse: id }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Classe inexistante");
                }
                if (emailToken != classe.courriel) {
                    return res.status(403).send("Tentative de renommage de cours d'un autre utilisateur")
                }
                let path = "./Classes/classe" + id + "/depot/";
                /* try {
                     // on vérifie que l'ancien cours existe bien 
                     if (fs.existsSync(path + ancienneMatiere)) {
                         // s'il existe alors on peut le renommer
                         fs.renameSync(path + ancienneMatiere, path + nouvMatiere);
                         console.log("renommage de la matière " + ancienneMatiere + " en " + nouvMatiere + " effectuee")
                         return res.status(201);
                         // sinon le cours n'a pas été trouvé
                     } else {
                         console.log("Cours inexistant");
                         return res.status(404).send("Pas de matière portant le nom " + ancienneMatiere + " trouvée.");
                     }
     
                 } catch (err) {
                     console.error(err)
                     return res.status(520).send("Erreur lors de la vérification des dossiers")
                 }*/
                renameDoc(path, ancienneMatiere, nouvMatiere, function (code) {
                    return res.status(code)
                })
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas une classe, soit pas la bonne classe : accès interdit')
        return res.status(403).send("Tentative de renommage de matiere d'un autre utilisateur")
    }
}


/**
 * Fonction qui permet de renommer un document selon l'ancien et le nouveau nom donné.
 * Vérifie aussi que le chemin existe avant de renommer.
 * @param {String} path le chemin où se situe le fichier/dossier à renommer
 * @param {String} oldname l'ancien nom du fichier/dossier
 * @param {String} newname le nouveau nom du fichier/dossier
 * @param {*} callback 
 * @returns une fonction callback, qui contient un code HTTP
 */
function renameDoc(path, oldname, newname, callback) {
    try {
        // on vérifie que l'ancien nom existe bien 
        if (fs.existsSync(path + oldname)) {
            // s'il existe alors on peut le renommer
            fs.renameSync(path + oldname, path + newname);
            console.log("renommage du fichier/dossier  " + oldname + " en " + newname + " effectué.")
            return callback(201);
            // sinon le document n'a pas été trouvé
        } else {
            console.log("Pas de dossier/fichier portant le nom " + oldname + " trouvé.");
            return callback(404);
        }
    } catch (err) {
        console.error("Erreur lors de la vérification des dossiers" + err)
        return callback(520);
    }
}


module.exports = {
    renameCoursClasse,
    renameCoursEleve,
    renameMatiereClasse,
    renameMatiereEleve
}