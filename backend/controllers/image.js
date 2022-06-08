const fs = require('fs');


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
        return res.status(407).send("La forme du mail est incorrecte.")
    }

    const path = "./Documents/" + email + "/images";
    avatar = JSON.stringify(avatar)
    verificationChemin(path)
    // on enregistre le fichier JSON correspondant à l'avatar de l'élève
    fs.writeFile(path + "/avatar.json", avatar, 'utf8', function (err) {
        if (err) {
            console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
            return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
        }
        console.log("Le fichier JSON a bien été sauvegardé");
        return res.status(201).send("Enregistrement effectué");
    });

}


/**
 * Sauvegarde l'avatar de l'élève dont le mail est donné.
 * Crée les dossiers nécessaires s'ils n'existent pas.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveAvatarAsImage = (req, res) => {
    console.log("\n*** Sauvegarde de l'avatar en image ***");
    const avatar = req.file;
    const email = req.body.mail;

   if ( avatar == undefined || avatar.buffer == null) {
        console.log("Pas d'image d'avatar")
        console.log(req.body.file)
        console.log(req.body.filename)
        return res.status(404).send("Erreur : aucun avatar trouvé")
    }
    console.log(" nom fichier " + req.body.filename)
    if (100 <= email.length || !(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"))) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.status(400).send("La forme du mail %s est incorrecte.", email)
    }

    const path = "./Documents/" + email + "/images"

    // sauvegarde image
    fs.writeFile(path + "/avatar.png", avatar.buffer, 'utf8', function (err, data) {
        if (err) {
            console.log("Erreur lors de l'enregistrement de l'avatar en image : " + err);
            return res.status(600).send("Erreur lors de l'enregistrement de l'avatar, réesayez.")
        }
        console.log("L'avatar a bien été sauvegardé");
        return res.status(201).json(avatar.buffer);
    });
}


/**
 * Retourne l'avatar' de l'élève, s'il n'en a pas, retourne un avatar par défaut
 * @param {String} email l'email de l'élève dont on veut récupèrer l'avatar'
 * @param {*} callback la fonction callback qui renvoie l'avatar ou une erreur
 */
function getAvatar(mail, callback) {
    const path = "Documents/" + mail + "/images";
    verificationChemin(path)
    fs.readFile(path + "/avatar.json", 'utf-8', function (err, avatar) {
        if (err) {
            console.log('Erreur lors de la récupération de l\'avatar : ' + err)
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
                shirtColor: "#000",
                shirtStyle: "polo"
            }
            //avatar = JSON.stringify(avatar)
            console.log("avatar crée")
            // on envoie le fichier json au front
            return callback({ avatar: avatar });
        }
        avatar = JSON.parse(avatar)

        console.log("avatar récupéré")
        // on envoie le fichier json au front
        return callback({ avatar: avatar });
    })
}


/**
 * Retourne l'avatar de l'élève sous forme d'image, s'il n'en a pas, retourne une photo par défaut (kiwi)
 * @param {String} email l'email de l'élève dont on veut récupèrer l'avatar '
 * @param {*} callback la fonction callback qui renvoie les informations de manière synchrone à qui fait appel de la fonction
 */
function getAvatarAsImage(email, callback) {
    const path = "./Documents/" + email + "/images/avatar.png";

    fs.readFile(path, function (err, avatar) {
        if (err) {
            fs.readFile("./Image/kiwi.png", function (error, avtr) {
                if (error) {
                    console.log("erreur lors de la recup de la photo par défaut " + error)
                    return callback(new Error("L'élève n'a pas de photo de profil."));
                } else {
                    return callback(null, { avatarAsImg: avtr });

                }
            })
        } else {
            return callback(null, { avatarAsImg: avatar });
        }
    });
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

    const path = "./Documents/" + email + "/images"
    verificationChemin(path)
    const type = img.mimetype.split("/")[1]
    console.log("type " + type)
    // avant de sauvegarder on va supprimer les anciennes photos de profil, s'il en existe
    fs.readdir(path, function (err, files) {
        if (err) {
            console.log("erreur durant la récupération " + err)
            return res.status(600).send('Erreur lors de la récupération de la pp.');
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
        fs.writeFile(path + "/photo." + type, img.buffer, 'utf8', function (err, data) {
            if (err) {
                console.log("Erreur lors de l'enregistrement de la photo : " + err);
                return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
            }
            console.log("La photo a bien été sauvegardée");
            return res.status(201).json(img.buffer);
        });
    })
}


/**
 * Retourne la photo de profil de l'élève, s'il n'en a pas, retourne une photo par défaut (chat)
 * @param {String} email l'email de l'élève dont on veut récupèrer la photo de profil
 * @param {*} callback la fonction callback qui renvoie les informations de manière synchrone à qui fait appel de la fonction
 */
function getImage(email, callback) {
    const path = "./Documents/" + email + "/images";
    let file = "";
    verificationChemin(path)
    fs.readdir(path, function (err, files) {
        if (err) {
            console.log("erreur durant la récupération " + err)
            return callback(new Error('Erreur lors de la récupération de la photo de profil.'));
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
                        console.log("erreur lors de la recup de la photo par défaut " + error)
                        return callback(new Error("L'élève n'a pas de photo de profil."));
                    }
                    return callback(null, { image: img });
                })
            } else {
                fs.readFile(path + "/" + file, function (err, image) {
                    if (err) {
                        console.log("Erreur lors de la recup de pp " + err)
                        return callback(err)
                    }
                    return callback(null, { image: image });
                });
            }
        }
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


module.exports = {
    saveAvatar,
    getAvatar,
    saveAvatarAsImage,
    getAvatarAsImage,
    getImage,
    savePicture,
    verificationChemin
}