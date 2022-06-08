const fs = require('fs');


/**
 * Supprime un fichier de l'utilisateur 
 * @param {*} req la requête du client, contient :  
 * • mail : le mail de l'utilisateur  
 * • name : le nom du fichier à supprimer
 * @param {*} res la réponse du serveur
 * @returns res, la réponse du serveur
 */
const deleteFile=(req,res)=>{
    console.log("\n*** Suppression d'un cours ***")
    const email = req.body.mail;
    const cours=req.body.name;

    let path = "./Documents/" + email + "/" + cours;

    const code = deleteCours(path)
    console.log("code http : " + code)
    if (code == 201) {
        return res.status(code).send("suppression réussie")
    }
    return res.sendStatus(code);
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
                // suppression
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


module.exports = {deleteFile }