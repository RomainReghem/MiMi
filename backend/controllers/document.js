const Eleve = require('../models/users').Eleve

const fs = require('fs');

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
           // const path = "./testeleve/eleve" + num + "/avatar"
            // d'abord on essaie d'accèder au dossier où est sauvegardé l'avatar de l'élève
           /* fs.access(path, (err) => {
                if (err) {
                    // ça veut dire qu'aucun dossier n'existe
                    // on crée donc le dossier
                    fs.mkdir(path, (err) => {
                        if (err) {
                            console.log("Erreur lors de la création de dossier")
                            return res.status(600).send("Erreur lors de la création de dossier")
                        }
                        console.log("dossier crée")

                    })
                }
            })*/
            // Création des dossiers si nécessaire
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
            avatar = JSON.parse(avatar)
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

const getAvatar = (req, res) => {
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
            const path = "./testeleve/eleve" + num + "/avatar/avatar"+num+".json"
            fs.readFile(path, 'utf-80', function(err, avatar){
                if(err){
                    console.log('erreur lors de la récupération de l\'avatar')
                    return res.status(600).send("Problème de lecture de l'avatar.")
                }
                console.log("avatar récupéré")
                // on envoie le fichier json au front
                res.json({avatar:avatar})
            })
        })
}

module.exports = { saveAvatar, getAvatar }