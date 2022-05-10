const Eleve = require('../models/users').Eleve

const fs = require('fs');

/**
 * Sauvegarde l'avatar de l'élève dont le mail est donné.
 * Crée les dossiers nécessaires s'ils n'existent pas.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveAvatar = (req, res) => {
    let avatar = req.body.avatar;
    const email = req.body.mail;
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
            const path = "./testeleve/eleve" + num + "/avatar"

            // Création des dossiers quand n'existent pas
            try {
                if (!fs.existsSync('./testeleve')) {
                    fs.mkdirSync('./testeleve');
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier test")
            }

            try {
                if (!fs.existsSync('./testeleve/eleve' + num)) {
                    fs.mkdirSync('./testeleve/eleve' + num);
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier classe")
            }

            try {
                if (!fs.existsSync('./testeleve/eleve' + num + "/avatar")) {
                    fs.mkdirSync('./testeleve/eleve' + num + "/avatar");
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier avatar")
            }
            // mise en forme du JSON pour son enregistrement            
            avatar = JSON.stringify(avatar)

            // on enregistre le fichier JSON correspondant à l'avatar de l'élève
            fs.writeFile(path + "/avatar" + num + ".json", avatar, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement de l'avatar : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("Le fichier JSON a bien été sauvegardé");
                res.status(201).send("Enregistrement effectué");
            });

        });
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
            const path = "./testeleve/eleve" + num + "/avatar/avatar" + num + ".json"
            fs.readFile(path, 'utf-80', function (err, avatar) {
                if (err) {
                    console.log('erreur lors de la récupération de l\'avatar')
                    return res.status(600).send("Problème de lecture de l'avatar.")
                }
                console.log("avatar récupéré")
                // on envoie le fichier json au front
                res.json({ avatar: avatar })
            })
        })
}

/**
 * Sauvegarde sur le serveur le document dont la matière est donné dans le dossier approprié.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveCoursEleve = (req, res) => {
    //pour l'eleve
    const matiere = req.body.cours;
    const mail = req.body.mail;
    const doc = req.body.doc;

    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "./testeleve/eleve" + num + "/depot/" + matiere;
            // Création des dossiers quand n'existent pas
            try {
                if (!fs.existsSync('./testeleve')) {
                    fs.mkdirSync('./testeleve');
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier test")
            }

            try {
                if (!fs.existsSync('./testeleve/eleve' + num)) {
                    fs.mkdirSync('./testeleve/eleve' + num);
                }
            } catch (err) {
                console.error(err);
                return res.status(600).send("Erreur lors de la création de dossier classe")
            }

            try {
                if (!fs.existsSync('./testeleve/eleve' + num + "/depot")) {
                    fs.mkdirSync('./testeleve/eleve' + num + "/depot");
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
                return res.status(600).send("Erreur lors de la création de dossier pour la matiere "+matiere)
            }

            fs.writeFile(path, doc, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement du document : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("Le fichier a bien été sauvegardé");
                res.status(201).send("Enregistrement effectué");
            });

            console.log("Le fichier a bien été sauvegardé");
            res.status(201).send("Enregistrement effectué");
        })
}

/*

const saveCoursProf =(req, res)=>{

}

const getCoursEleve = (req, res)=>{

}*/

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
/*const getCoursProf =(req, res)=>{

}*/

module.exports = { saveAvatar, getAvatar }