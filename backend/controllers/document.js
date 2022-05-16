const Eleve = require('../models/users').Eleve

const fs = require('fs');

/**
 * Sauvegarde sur le serveur le document dont la matière est donné dans le dossier approprié.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveCoursEleve = (req, res, next) => {
    console.log("\n*** Sauvegarde de cours d'un eleve ***")
    const matiere = req.body.cours;
    const email = req.body.mail;
    const file = req.file

    if (file == null) {
        console.log("Pas de fichier")
        return res.status(600).send("Erreur serveur")
    }
    if (file.mimetype != "application/pdf") {
        console.log("Pas le bon type de fichier")
        return res.status(403).send("Le fichier n'est pas un pdf.")
    }
    const nom = file.originalname;
    console.log(" nom fichier " + nom + ' type ' + file.mimetype)
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }
    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere;
            // Création des dossiers quand n'existent pas
            verificationChemin(path)

            /*try {
                fs.writeFileSync(path + "/"+nom , file.buffer)
                //file written successfully
                return res.status(201).send("Enregistrement effectué");

              } catch (err) {
                console.error(err)
                return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")

              }*/

            /*fs.rename("./Eleves/temp/" + nom, path + "/" + nom, function (err) {
                 if (err) {
                     console.log("Erreur lors de l'enregistrement du document : " + err);
                     return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                 }
                 console.log("Le fichier a bien été sauvegardé");
                 return res.status(201).send("Enregistrement effectué");
             })*/

            fs.writeFile(path + "/" + nom, file.buffer, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement du document : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("Le fichier a bien été sauvegardé");
                return res.status(201).send("Enregistrement effectué");
            });
        })
}

function verificationChemin(pathToVerify) {
    let dossiers = pathToVerify.split('/')
    let path = dossiers[0]
    for (var i = 1; i < dossiers.length; i++) {
        try {
            path +="/"+ dossiers[i]
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        } catch (err) {
            console.error(err);
            return res.status(600).send("Erreur lors de la création de dossier pour le chemin" + path)
        }
        //console.log("Chemin " + path + " fait")
    }
}

const getAllMatieresEleve = (req, res) => {
    const email = req.body.mail;

    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot";
            const folders = getAllFiles(path);
            return res.json({ matieres: folders })
        })
}

const getAllCoursEleve = (req, res) => {
    const email = req.query.mail;
    const matiere = req.query.cours;

    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere;
            const files = getAllFiles(path);
            return res.json({ cours: files })
        })
}

const getCoursEleve = (req, res) => {
    const email = req.query.mail;
    const matiere = req.query.cours;
    const name = req.body.name;
    console.log(name)
    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere + "/" + name;
            // const files = getAllFiles(path);
            /* fs.readFile(path, 'utf-80', function (err, avatar) {
                 if (err) {
                     console.log('erreur lors de la récupération de l\'avatar')
                     return res.status(600).send("Problème de lecture de l'avatar.")
                 }
                 console.log("avatar récupéré")
                 // on envoie le fichier json au front
                 res.json({ avatar: avatar })
             })*/
            const file = fs.createReadStream(path);
            res.setHeader('Content-Disposition', 'attachment: filename="' + name + (new Date()).toISOString() + '"')
            file.pipe(res)
        })
}

/**
 * Retourne tous les fichiers ou les répertoires en fonction du chemin donné
 * @param {*} path le chemin du répertoire à lister
 */
async function getAllFiles(path) {
    fs.readdirSync(path, function (err, files) {
        if (err) {
            console.log("erreur durant la récupération " + err)
            return [];
        } else {
            for (const file of files) {
                console.log(file)
            }
            return files;
        }
    })

}

module.exports = { saveCoursEleve, getAllCoursEleve, getAllMatieresEleve, getCoursEleve }