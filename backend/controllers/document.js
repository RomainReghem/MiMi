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

/**
 * Cette fonction permet de vérifier si le chemin donné en paramètre existe déjà, sinon crée les dossiers nécessaires
 * @param {String} pathToVerify le chemin à vérifier
 * @returns 
 */
function verificationChemin(pathToVerify) {
    // on divise les dossiers du chemin
    let dossiers = pathToVerify.split('/')
    // on commence = la base
    let path = dossiers[0]
    // on parcourt le reste des dossiers
    for (var i = 1; i < dossiers.length; i++) {
        try {
            // on ajoute les dossiers au chemin
            path += "/" + dossiers[i]
            // si le chemin existe, alors le dossier est déjà présent
            if (!fs.existsSync(path)) {
                // sinon on crée le dossier
                fs.mkdirSync(path);
            }
        } catch (err) {
            console.error(err);
            return res.status(600).send("Erreur lors de la création de dossier pour le chemin" + path)
        }
    }
}

/**
 * Retourne le nom de toutes les matières d'un élève
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllMatieresEleve = (req, res) => {
    console.log("\n*** Récupération des matières ***")
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

/**
 * Retourne le nom de tous les fichiers concernant une matiére donnée, pour un élève
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllCoursEleve = (req, res) => {
    console.log("\n*** Récupération des cours d'une matiere***")
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

/**
 * Retourne un fichier précis, selon la matière et le nom du fichier donné
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getCoursEleve = (req, res) => {
    console.log("\n*** Récupération d'un cours ***")
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
            const path = "./Eleves/eleve" + num + "/depot/" + matiere + "/" + name + ".pdf";
            // const files = getAllFiles(path);
            /* fs.readFile(path, 'utf-8', function (err, avatar) {
                 if (err) {
                     console.log('erreur lors de la récupération de l\'avatar')
                     return res.status(600).send("Problème de lecture de l'avatar.")
                 }
                 console.log("avatar récupéré")
                 // on envoie le fichier json au front
                 res.json({ avatar: avatar })
             })*/
            /*  const file = fs.createReadStream(path);
              res.setHeader('Content-Disposition', 'attachment: filename="' + name + (new Date()).toISOString() + '"')
              file.pipe(res)*/
            fs.readFile(path, function (err, fichier) {
                if (err) {
                    console.log("erreur lors de la recup de fichier " + err)
                    return res.status(520).send(err)
                }
                res.writeHead(200, { 'Content-Type': 'application/pdf' });
                res.write(fichier);
                console.log("Récupération ok")

                return res.end();
                // return res.send({ file: fichier });
            });
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

async function verifyUnique(path, name) {
    fs.readdirSync(path+"/"+name, function (err, files) {
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