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
            const path = "Eleves/eleve" + num + "/avatar"

            // mise en forme du JSON pour son enregistrement            
           avatar = JSON.stringify(avatar)
            verificationChemin(path)
            // on enregistre le fichier JSON correspondant à l'avatar de l'élève
            fs.writeFile(path + "/avatar" + num + ".json", avatar, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("Le fichier JSON a bien été sauvegardé");
                res.status(201).send("Enregistrement effectué");
            });
                        //saveJSON(path, avatar, num, res);


        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        })
}

/**
 * Sauvegarde le fichier JSON de l'avatar dans le dossier dédié
 * @param {String} path le chemin où le fichier doit être sauvegardé
 * @param {Object} json l'avatar en JSON
 * @param {Number} num l'id de l'élève de qui on sauvegarde l'avatar
 * @param {*} res la réponse
 */
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
            const path = "Eleves/eleve" + num + "/avatar";
            verificationChemin(path)
            fs.readFile(path+"/avatar"+num+".json", 'utf-8', function (err, avatar) {
                if (err) {
                    console.log('erreur lors de la récupération de l\'avatar : '+err)
                    //return res.status(600).send("Problème de lecture de l'avatar.")
                    avatar = {
                        bgColor: "#E0DDFF",
                        earSize: "small",
                        eyeBrowStyle: "up",
                        eyeStyle: "oval",
                        faceColor: "#AC6651",
                        glassesStyle: "none",
                        hairColor: "#000",
                        hairStyle: "thick",
                        hatColor: "#000",
                        hatStyle: "none",
                        mouthStyle: "laugh",
                        noseStyle: "round",
                        shape: "square",
                        shirtColor: "#6BD9E9",
                        shirtStyle: "polo"
                    }
                    avatar = JSON.stringify(avatar)
                }
                console.log("avatar récupéré")
                // on envoie le fichier json au front
                res.json({ avatar: avatar })
            })

           /* getJSON(path, num, res, function(err, avatar){
                if(err){
                    return res.send(err).status(520);
                }
                return res.json(avatar).status(200)
            })*/
            
        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        })
}

/**
 * Permet de retourner l'avatar au format json, au chemin passé, avec l'identifiant de l'élève donné.
 * @param {String} path le chemin vers l'avatar
 * @param {Number} num le numéro de l'élève
 * @param {*} res la réponse à renvoyer au client
 */
async function getJSON(path, num, res, callback) {
    let avatar = "";
    await bucket.file(path + "/avatar" + num + ".json").createReadStream()
        .on('error', function (err) {
            console.log(err);
            callback(err);
        })
        .on('data', function (response) {
            avatar += response;
        })
        .on('end', function () {
            //console.log("AVATAR : " + avatar)
            console.log("avatar récupéré");
            // on envoie le fichier json au front
            callback({ avatar: avatar });
        })
}

/**
 * Sauvegarde localement l'image de profil d'un élève dans un dossier dédié, sous le nom "photo".
 * Vérifie aussi que le fichier passé est bien une image.  
 * Un middleware se charge de retrouver la photo.
 * @param {*} req la requête du client, doit contenir le fichier téléchargé et l'adresse mail de l'élève
 * @param {*} res la réponse du serveur
 * @returns la réponse
 */
const savePicture = (req, res) => {
    console.log("\n*** Sauvegarde de l'image de profil de l'élève ***")
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
    if (100 <= email.length || !(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"))) {
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
            const type = img.mimetype.split("/")[1]
            console.log("type " + type)
            // avant de sauvegarder on va supprimer les anciennes photos de profil, s'il en existe
            fs.readdir(path, function (err, files) {
                if (err) {
                    console.log("erreur durant la récupération " + err)
                    return res.status(600).send('Erreur lors de la récupèration de la pp.');
                }
                // on va supprimer l'ancienne photo de profil
                for (const f of files) {
                    if (f.startsWith('photo')) {
                        fs.unlink(path + "/" + f, function (err) {
                            if (err) {
                                console.log("erreur lors de la suppression de pp " + err)
                                return res.status(520).send(err)
                            }
                            //console.log("Suppression ok")
                        });
                    }
                }
                // sauvegarde image
                fs.writeFile(path + "/photo." + type, img.buffer, 'utf8', function (err) {
                    if (err) {
                        console.log("Erreur lors de l'enregistrement de la photo : " + err);
                        return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                    }
                    console.log("La photo a bien été sauvegardée");
                    return res.status(201).send(img.buffer);
                });
            })
        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        })
}

/**
 * Renvoie au client la photo de profil de l'utilisateur dont le mail est donné
 * @param {*} req la requête du client 
 * @param {*} res la réponse du serveur
 * @returns la réponse du serveur
 */
const getPicture = (req, res) => {
    console.log("\n*** Récupération de l'image de profil de l'élève ***")
    const email = req.query.mail;
    if (email == undefined) {
        console.log("récupération d'image impossible sans mail!")
        return res.sendStatus(400)
    }

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
            const path = "./Eleves/eleve" + num + "/avatar";
            let file = "";
            verificationChemin(path)
            fs.readdir(path, function (err, files) {
                if (err) {
                    console.log("erreur durant la récupération " + err)
                    return res.status(600).send('Erreur lors de la récupèration de la pp.');
                } else {
                    for (const f of files) {
                        // les images de profils sont stockées sous le nom de photo
                        if (f.startsWith('photo')) {
                            file = f;
                        }
                    }
                    if (file == "") {
                        console.log("pas d'image")
                        // on va retourner une image par défaut 
                        fs.readFile("./Image/chat.jpg", function (error, img) {
                            if (err) {
                                console.log("erreur lors de la recup de la photo par défeut " + error)
                                return res.send("L'élève n'a pas de photo de profil.").status(204)
                            }
                            return res.send({ image: img });
                        })
                    }else{
                        fs.readFile(path + "/" + file, function (err, image) {
                            if (err) {
                                console.log("erreur lors de la recup de pp " + err)
                                return res.status(520).send(err)
                            }
                            return res.send({ image: image });
                        });
                    }
                }
            })
        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        })
}


/**
 * Cette fonction permet de vérifier si le chemin passé en paramètre existe, et si ce n'est pas le cas, il le crée
 * @param {String} pathToVerify le chemin dont l'existence doit être vérifiée
 */
function verificationChemin(pathToVerify) {
    let dossiers = pathToVerify.split('/')
    let path = dossiers[0]
    for (var i = 1; i < dossiers.length; i++) {
        try {
            path += "/" + dossiers[i]
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        } catch (err) {
            console.error(err);
            // return res.status(600).send("Erreur lors de la création de dossier pour le chemin" + path)
        }
    }
}

module.exports = { saveAvatar, getAvatar, savePicture, getPicture, verificationChemin }