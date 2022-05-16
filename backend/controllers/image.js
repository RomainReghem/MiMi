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

const savePicture=(req,res)=>{
    console.log("\nSauvegarde de l'image de profil de l'élève")
    const img = req.file
    const email = req.body.mail;

    if (img == null) {
        console.log("Pas de fichier")
        return res.status(600).send("Erreur serveur")
    }
    if (!(img.mimetype.startsWith("image/"))) {
        console.log("Pas le bon type de fichier")
        return res.status(403).send("Le fichier n'est pas une image.")
    }
    const nom = img.originalname;
    console.log(" nom fichier " + nom + ' type ' + img.mimetype)
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
            const path = "./Eleves/eleve" + num + "/avatar/";
           
            verificationChemin(path)
            const type=img.mimetype.split("/")[1]
             console.log("type "+type)
            fs.writeFile(path + "/photo."+type, img.buffer, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement de la photo : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("La photo a bien été sauvegardée");
                return res.status(201).send("Enregistrement effectué");
            });
        })
}

const getPicture=(req,res)=>{
    console.log("\nRécupération de l'image de profil de l'élève")
    const email = req.query.mail;

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
            const path = "./Eleves/eleve" + num + "/avatar/photo.jpg";
           
            const file = fs.createReadStream(path)
            res.send({img:file}).status(201)
        })
}
 
function verificationChemin(pathToVerify){
    let dossiers = pathToVerify.split('/')
    let path=dossiers[0]
    for (var i=1 ; i< dossiers.length ; i++){
        try {
            path+="/"+dossiers[i]
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        } catch (err) {
            console.error(err);
            return res.status(600).send("Erreur lors de la création de dossier pour le chemin" + path)
        }
    }
}

module.exports = { saveAvatar, getAvatar, savePicture}