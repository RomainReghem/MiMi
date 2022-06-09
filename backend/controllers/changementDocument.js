const fs = require('fs');
const {verifNom} = require("./ajoutDocument")

/**
 * Renomme le cours d'un utilisateur avec le nouveau nom donné
 * @param {*} req la requête du client, doit contenir l'email de l'élève, l'ancien nom du cours et le nouveau nom.
 * @param {*} res la réponse du serveur
 */
 const renameFile = (req, res) => {
    console.log("\n*** Changement de nom de fichier ***")

    let nouvCours = req.body.newName;
    const ancienCours = req.body.currentName;
    const email = req.body.mail

    if (nouvCours == "") {
        nouvCours = ancienCours;
    }

    // on va vérifier que le nom du fichier finisse bien par ".pdf", si ce n'est pas le cas, on l'ajoutera au nom
    if (!(nouvCours.match("(.pdf|.PDF)$"))) {
        nouvCours += '.pdf'
    }

    let path = "./Documents/" + email + "/";

    if(nouvCours==ancienCours){
        return res.status(204).send("Même nom : aucun changement")
    }
    // avant de renommer on vérifie que le nouveau nom soit bien unique
    let name = verifNom(path, nouvCours);
    renameDoc(path, ancienCours, name, function (code) {
        return res.sendStatus(code)
    })
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
            console.log("Pas de dossier/fichier portant le nom " + oldname + " trouvé dans le chemin %s.", path);
            return callback(404);
        }
    } catch (err) {
        console.error("Erreur lors de la vérification des dossiers" + err)
        return callback(520);
    }
}


module.exports = {
    renameFile
}