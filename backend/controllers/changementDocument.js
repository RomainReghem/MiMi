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

    Eleve.findOne({
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

        });
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

    Eleve.findOne({
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
            return res.status(renameDoc(path, ancienneMatiere, nouvMatiere))

        });
}

function renameDoc(path, oldname, newname) {
    try {
        // on vérifie que l'ancien nom existe bien 
        if (fs.existsSync(path + oldname)) {
            // s'il existe alors on peut le renommer
            fs.renameSync(path + oldname, path + newname);
            console.log("renommage du fichier/dossier  " + oldname + " en " + newname + " effectué.")
            return 201;
            // sinon le document n'a pas été trouvé
        } else {
            console.log("Pas de dossier/fichier portant le nom " + oldname + " trouvé.");
            return 404;
        }
    } catch (err) {
        console.error("Erreur lors de la vérification des dossiers" + err)
        return 520;
    }
}