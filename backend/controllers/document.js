const Eleve = require('../models/users').Eleve

const fs = require('fs');

const { Storage } = require('@google-cloud/storage');

const google_cloud_project_id = "oceanic-cacao-348707";
const google_cloud_keyfile = "./oceanic-cacao-348707-bcb3c919f769.json";

const storage = new Storage({
    projectId: google_cloud_project_id,
    keyFilename: google_cloud_keyfile,
});

const bucket = storage.bucket("bucket_projet_mimi");

/**
 * Sauvegarde l'avatar de l'élève dont le mail est donné.
 * Crée les dossiers nécessaires s'ils n'existent pas.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveAvatar = (req, res) => {
    console.log("\n*** Sauvegarde d'avatar ***")
    let avatar = req.body.avatar;
    const email = req.body.mail;
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }
    Eleve.findOne({
        where:
            { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "testeleve/eleve" + num + "/avatar"

            // mise en forme du JSON pour son enregistrement            
            avatar = JSON.stringify(avatar)

            saveJSON(path, avatar, num, res);

        });
}

async function saveJSON(path, json, num, res) {
    await bucket.file(path + "/avatar" + num + ".json").save(json, function (err) {
        if (err) {
            return res.status(600).send("Erreur lors de la sauvegarde de l'avatar.")
        }
        console.log("Le fichier JSON a bien été sauvegardé");
        return res.status(201).send("Enregistrement effectué");
    })
}

/**
 * Retourne l'avatar de l'élève dont le mail est donné.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAvatar = (req, res) => {
    console.log("\n*** Récupération d'avatar ***")

    const email = req.query.mail;
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }
    Eleve.findOne({
        where:
            { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "testeleve/eleve" + num + "/avatar"
            /*fs.readFile(path, 'utf-8', function (err, avatar) {
                if (err) {
                    console.log('erreur lors de la récupération de l\'avatar')
                    return res.status(600).send("Problème de lecture de l'avatar.")
                }
                console.log("avatar récupéré")
                // on envoie le fichier json au front
                res.json({ avatar: avatar })
            })*/
            getJSON(path, num, res)
        })
}

async function getJSON(path, num, res) {
    let avatar = "";
    await bucket.file(path + "/avatar" + num + ".json").createReadStream()
        .on('error', function (err) {
            console.log(err);
            return res.status(520)
        })
        .on('data', function (response) {
            avatar += response;
        })
        .on('end', function () {
            //console.log("AVATAR : " + avatar)
            console.log("avatar récupéré");
            // on envoie le fichier json au front
            return res.json({ avatar: avatar });
        })
}


/**
 * Sauvegarde sur le serveur le document dont la matière est donné dans le dossier approprié.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveCoursEleve = (req, res) => {
    console.log("\n*** Sauvegarde de cours d'un eleve ***")
    //pour l'eleve
    const matiere = req.body.cours;
    const email = req.body.mail;
    const doc = req.body.data;

   console.log("document "+doc+" autre"+req.files+"fg "+req.file)
    //console.log("test "+req.selectedFile)
   /*for(r in req){
        console.log(" ok "+r)
    }*/
    console.log(req)
    const nom ="test.pdf" //doc.name;
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
            try {
                if (!fs.existsSync('./Eleves')) {
                    fs.mkdirSync('./Eleves');
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier test")
            }

            try {
                if (!fs.existsSync('./Eleves/eleve' + num)) {
                    fs.mkdirSync('./Eleves/eleve' + num);
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier classe")
            }

            try {
                if (!fs.existsSync('./Eleves/eleve' + num + "/depot")) {
                    fs.mkdirSync('./Eleves/eleve' + num + "/depot");
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier depot")
            }

            try {
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier pour la matiere " + matiere)
            }

            fs.writeFile(path + "/" + nom, doc, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement du document : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("Le fichier a bien été sauvegardé");
                return res.status(201).send("Enregistrement effectué");
            });
        })
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
    const email = req.body.mail;
    const matiere = req.body.cours;

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

const getCoursEleve=(req, res)=>{
    const email = req.body.mail;
    const matiere = req.body.cours;
    const name =req.body.name;
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
            const path = "./Eleves/eleve" + num + "/depot/" + matiere;
           // const files = getAllFiles(path);
        })
}


/**
 * Retourne tous les fichiers ou les répertoires en fonction du chemin donné
 * @param {*} path le chemin du répertoire à lister
 */
async function getAllFiles(path) {
    fs.readdirSync(dir, function (err, files) {
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



module.exports = { saveAvatar, getAvatar, saveCoursEleve , getAllCoursEleve, getAllMatieresEleve, getCoursEleve}