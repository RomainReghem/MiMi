// pour l'accès aux documents
const fs = require('fs');
const { Eleve, Classe } = require('../models/users');

const { Storage } = require('@google-cloud/storage');

const google_cloud_project_id = "oceanic-cacao-348707";
const google_cloud_keyfile = "./oceanic-cacao-348707-bcb3c919f769.json";

const storage = new Storage({
    projectId: google_cloud_project_id,
    keyFilename: google_cloud_keyfile,
});

const bucket = storage.bucket("bucket_projet_mimi");

const { verificationChemin } =require('./image');

/**
 * Renvoie au client le pseudo de l'élève en fonction de son adresse mail.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur
 */
const getUsernameStudent = (req, res) => {
    console.log("\n*** Récupération du pseudo ***")
    const email = req.query.mail

    if (email == undefined) {
        return res.status(404).send("Pas de mail")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        return res.status(400).send("Mail incorrect")
    }

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peut récupèrer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['pseudo'],
            where: {
                courriel: email
            }
        }).then(eleve => {
            if (eleve) {
                console.log('pseudo ' + eleve.pseudo)
                return res.json({ pseudo: eleve.pseudo })
            } else {
                return res.status(409).send("Aucun élève avec cette adresse")
            }
        })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        return res.send("Pas un élève / pas le bon élève").status(403)
    }
}


/**
 * Renvoie au client le nom et prénom de l'élève en fonction de son adresse mail.
 * 
 * @param {*} req la requête du client, contient le mail de l'élève
 * @param {*} res la réponse du serveur
 */
const getNameStudent = (req, res) => {
    console.log("\n*** Récupération du nom et du prénom de l'élève ***")
    const email = req.query.mail

    if (email == undefined) {
        return res.status(404).send("Pas de mail")
    }
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        return res.status(400).send("Mail incorrect")
    }

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peut récupèrer son propre pseudo
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['prenom', 'nom'],
            where: {
                courriel: email
            }
        }).then(eleve => {
            if (eleve) {
                console.log('prenom %s et nom %s ', eleve.prenom, eleve.nom)
                return res.json({ nom: eleve.nom, prenom: eleve.prenom })
            } else {
                return res.status(409).send("Aucun élève avec cette adresse")
            }
        })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        return res.send("Pas un élève / pas le bon élève").status(403)
    }
}


/**
 * Supprime l'élève en fonction de son mail.
 * Supprime aussi tous ses documents.
 * Supprime aussi ses scores aux jeux
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const deleteStudent = async (req, res) => {
    console.log('\n*** Suppression de compte élève ***')
    // on vérifie que le mail soit bien présent
    if (!req?.body?.mail) {
        console.log("Adresse mail manquante pour la suppression ")
        return res.status(400).send('Email manquant');
    }
    const email = req.body.mail
    // vérification du mail
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(407).send("Mail incorrect")
    }

    const role = req.role;
    const emailToken = req.mail
    // pas d'autre utilisateur que l'élève ne peuvent se supprimer
    if (role == "eleve" && emailToken == email) {
        // on cherche dans la bd l'eleve qui correspond au mail fourni
        Eleve.findOne({
            attributes: ['ideleve'],
            where: { courriel: email }
        })
            .then(eleve => {
                // si aucun élève n'a été trouvé
                if (!eleve) {
                    return res.status(401).send("Pas d'élève trouvé avec cet adresse mail.");
                }
                // sinon on supprime l'élève
                Eleve.destroy({
                    where: {
                        ideleve: eleve.ideleve
                    }
                }).then(() => {
                    // maintenant on doit supprimer les dossiers et les documents de l'élève
                    const num = eleve.ideleve;
                    const path = "./Eleves/eleve" + num
                    // supprime le dossier du chemin donné, ainsi que tout ce qui se trouve à l'intérieur
                    fs.rm(path, { recursive: true }, (err) => {
                        if (err) {
                            console.log("erreur suppression dossiers : " + err)
                            return res.status(500).send("Erreur lors de la suppression de documents.")
                        }
                        console.log("Suppression effectuée !")
                        return res.sendStatus(205);
                    })
                }).catch(err => {
                    console.log(err)
                    return res.send(err).status(520)
                });
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        return res.send("Pas un élève / pas le bon élève").status(403)
    }
}


/**
 * Retourne l'invitation et l'id de la classe associée à l'invitation dans un format JSON
 * 
 * @param {String} emailEleve l'email de l'èleve dont on veut l'invitation
 */
function getInvitation(emailEleve, cb) {
    console.log("\n***Récupération d'invitation.***")
    if (!(emailEleve.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= emailEleve.length) {
        console.log("forme mail incorrect")
        return cb(400)
    }

    Eleve.findOne({
        attributes: ['invitation', 'idclasse'],
        where: { courriel: emailEleve }
    })
        .then(eleve => {
            // si aucun élève n'a été trouvé
            if (!eleve) {
                return cb(404)
            }
            const invitation = eleve.invitation;
            if (invitation != "aucune") {
                Classe.findOne({ attributes: ["idclasse"], where: { idclasse: eleve.idclasse } })
                    .then(classe => {
                        if (!classe) {
                            return cb(404);
                        }
                        return cb({ invitation: invitation, idclasse: classe.idclasse })
                    })
                    .catch(err => {
                        console.log(err)
                        return cb({ erreur: err })
                    });
            } else {
                return cb({ invitation: invitation })
            }
        })
        .catch(err => {
            console.log(err)
            return cb({ erreur: err })
        });
}


// function pour récupérer le pseudo
function getUsername(email, cb) {
    Eleve.findOne({
        attributes: ['pseudo'],
        where: {
            courriel: email
        }
    }).then(eleve => {
        if (eleve) {
            console.log('pseudo ' + eleve.pseudo)
            return cb({ pseudo: eleve.pseudo })
        } else {
            console.log("Aucun élève avec cette adresse");
            return cb(404)
        }
    })
        .catch(err => {
            console.log(err)
            return cb(520)
        });
}


// fonction pour récupérer l'avatar
function getAvatar(id, callback) {
    const num = id;
    const path = "testeleve/eleve" + num + "/avatar";
    let avatar = "";
    bucket.file(path + "/avatar" + num + ".json").createReadStream()
        .on('error', function (err) {
            console.log(err);
            return callback(520);
        })
        .on('data', function (response) {
            avatar += response;
        })
        .on('end', function () {
            //console.log("AVATAR : " + avatar)
            console.log("avatar récupéré");
            // on envoie le fichier json au front
            return callback({ avatar: avatar });
        })
}

// fonction pour récuperer l'image de profil
function getImage(id, callback) {
    const num = id;
    const path = "./Eleves/eleve" + num + "/avatar";
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
                        console.log("erreur lors de la recup de la photo par défeut " + error)
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

module.exports = {
    getUsernameStudent,
    deleteStudent,
    getInvitation,
    getAvatar,
    getImage,
    getUsername
}
