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
    const matiere = req.body.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }
    Eleve.findOne({
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
            return res.status(code)

        });
}

/**
 * Supprime le cours d'une classe avec le nom donné
* @param {*} req la requête du client, doit contenir l'email de la classe, le nom du cours et le nom de la matière
* @param {*} res la réponse du serveur
*/
const deleteCoursClasse = (req, res) => {
    console.log("\n*** Suppression de cours de la classe ***")
    const email = req.body.mail;
    const cours = req.body.cours;
    const matiere = req.body.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }
    Classe.findOne({
        where: { courriel: email }
    })
        .then(classe => {
            if (!classe) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("classe inexistante");
            }
            const num = classe.idclasse;
            let path = "./Classes/classe" + num + "/depot/" + matiere + "/" + cours;

            const code = deleteCours(path)
            return res.status(code)

        });
}

/**
* Supprime des dossiers de la classe la matière donnée avec tous les cours contenus dedans
* @param {*} req la requête du client, doit contenir l'email de la classe et le nom de la matière à supprimer.
* @param {*} res la réponse du serveur
*/
const deleteMatiereClasse = (req, res) => {
    console.log("\n*** Suppression de matiere de la classe ***")
    const email = req.body.mail;
    const matiere = req.body.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        //console.log("forme mail incorrect")
        return res.sendStatus(400)
    }
    Classe.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                //console.log("Utilisateur pas trouvé");
                return res.status(404).send("classe inexistante");
            }
            const num = classe.idclasse
            let path = "./Classes/classe" + num + "/depot/" + matiere;

            const code = deleteMatiere(path)
            return res.status(code)
        });
}

/**
 * Supprime des dossiers de l'élève la matière donnée avec tous les cours contenus dedans
 * @param {*} req la requête du client, doit contenir l'email de l'élève et le nom de la matière à supprimer.
 * @param {*} res la réponse du serveur
 */
const deleteMatiereEleve = (req, res) => {
    console.log("\n*** Suppression de matiere de l'eleve ***")
    const email = req.body.mail;
    const matiere = req.body.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(400)
    }
    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            let path = "./Eleves/eleve" + num + "/depot/" + matiere;

            const code = deleteMatiere(path)
            return res.status(code)
        });
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

/**
 * Supprimer un repértoire en fonction du chemin donné.
 * @param {String} path le chemin du dossier à supprimer
 * @returns un code http associé à une erreur ou un succès
 */
function deleteMatiere(path) {
    try {
        // on vérifie que la matière existe bien 
        if (fs.existsSync(path)) {
            try {
                fs.rmdirSync(path, { recursive: true });
                console.log("suprresion de la matière " + path + " ok ")
                return 201;
            } catch (err) {
                console.error(err)
                return 520
            }
            // sinon la matière n'a pas été trouvée
        } else {
            console.log("Pas de matière dans le chemin " + path + ".");
            return 404;
        }

    } catch (err) {
        console.error("Erreur lors de la vérification des dossiers" + err)
        return 520;
    }
}

module.exports = { deleteCoursEleve, deleteMatiereEleve, deleteCoursClasse, deleteMatiereClasse }