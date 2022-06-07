const Eleve = require('../models/users').Eleve
const Classe = require('../models/users').Classe

const fs = require('fs');

/**
 * Sauvegarde sur le serveur le document dont la matière est donné dans le dossier approprié.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveCoursEleve = (req, res, next) => {
    console.log("\n*** Sauvegarde de cours d'un eleve ***")
    const matiere = "maths"//req.body.cours;
    const email = req.body.mail;
    const file = req.file

    // verify if multer couldn't find the file
    if (file == null) {
        console.log("Pas de fichier")
        return res.status(520).send("Erreur lecture du fichier : aucun fichier trouvé")
    }
    // verify if variable not undefined, meaning that we didn't get anything
    if (typeof matiere == undefined || typeof email == undefined) {
        console.log("valeurs nulles")
        return res.status(400).send("Erreur lecture des données : aucune donnée trouvée")
    }
    // on vérifie le type du fichier
    if (file.mimetype != "application/pdf") {
        console.log("Pas le bon type de fichier")
        return res.status(403).send("Le fichier n'est pas un pdf.")
    }
    // le nom du fichier, tel qu'il a été envoyé, avec l'extension
    const nom = file.originalname;
    //console.log(" nom fichier " + nom + ' type ' + file.mimetype)
    // on vérifie la forme du mail
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(400).send("Le mail donné n'est pas de la bonne forme.")
    }
    // le middleware qui vérifie les tokens a consigné le mail et le role du token 
    const role = req.role;
    const emailToken = req.mail
    // seul un eleve peut sauvegarder un fichier ici, celui à qui appartient les cours
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['ideleve'],
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

                // Vérification si un fichier est unique dans son chemin, si ce n'est pas le cas, il lui attribue un nouveau nom
                let name = verifNom(path, nom);
                // enregistrement du fichier à partir de son buffer
                fs.writeFile(path + "/" + name, file.buffer, 'utf8', function (err) {
                    if (err) {
                        console.log("Erreur lors de l'enregistrement du document : " + err);
                        return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                    }
                    console.log("Le fichier a bien été sauvegardé");
                    return res.status(201).send("Enregistrement effectué");
                });
            })
            .catch(err => {
                console.log("Erreur eleve.findOne : " + err)
                return res.send("Erreur lors de la récupération du compte élève").status(520)
            });
        // si ce n'est pas la meme personne à qui appartient les fichiers (role différent de celui d'eleve et/ou email qui ne correspond pas) 
    } else {
        console.log('soit pas un eleve, soit pas le bon eleve : accès interdit')
        return res.status(403).send("Tentative de sauvegarde de cours d'un autre utilisateur")
    }
}

/**
 * Sauvegarde sur le serveur le document dont la matière est donné dans le dossier approprié.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveCoursClasse = (req, res) => {
    console.log("\n*** Sauvegarde de cours d'une classe ***")
    const matiere = "maths"//req.body.cours;
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

    const role = req.role;
    const emailToken = req.mail
    if (role == "classe" && emailToken == email) {
        Classe.findOne({
            attributes: ['idclasse'],
            where: { courriel: email }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Classe pas trouvée")
                }
                const num = classe.idclasse;
                const path = "./Classes/classe" + num + "/depot/" + matiere;
                // Création des dossiers quand n'existent pas
                verificationChemin(path)

                // Vérification de si un fichier est unique dans son chemin, si ce n'est pas le cas, il lui attribue un nouveau nom
                let name = verifNom(path, nom);

                fs.writeFile(path + "/" + name, file.buffer, 'utf8', function (err) {
                    if (err) {
                        console.log("Erreur lors de l'enregistrement du document : " + err);
                        return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                    }
                    console.log("Le fichier a bien été sauvegardé");
                    return res.status(201).send("Enregistrement effectué");
                });
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            });
    } else {
        console.log('soit pas une classe, soit pas la bonne classe : accès interdit')
        return res.status(403).send("Tentative de sauvegarde de cours d'un autre utilisateur")
    }
}

/**
 * Ajoute dans les dossiers de l'élève donné la matière précisée
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const addMatiereEleve = (req, res) => {
    console.log("\n*** Ajout d'une matière ***")
    const email = req.query.mail;
    const matiere = "maths"//req.query.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }

    const role = req.role;
    const emailToken = req.mail
    if (role == "eleve" && emailToken == email) {
        Eleve.findOne({
            attributes: ['ideleve'],
            where: { courriel: email }
        })
            .then(eleve => {
                if (!eleve) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Élève inexistant");
                }
                const num = eleve.ideleve;
                const path = "./Eleves/eleve" + num + "/depot/" + matiere;
                verificationChemin(path)
                return res.status(200);
            });
    } else {
        console.log('soit pas un eleve, soit pas le bon eleve : accès interdit')
        return res.status(403).send("Tentative de sauvegarde de cours d'un autre utilisateur")
    }
}

/**
 * Ajoute dans les dossiers de la classe donné la matière précisée
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const addMatiereClasse = (req, res) => {
    console.log("\n*** Ajout d'une matière dans la classe***")
    const email = req.query.mail;
    const matiere = "maths"//req.query.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }

    const role = req.role;
    const emailToken = req.mail
    if (role == "classe" && emailToken == email) {
        Classe.findOne({
            attributes: ['idclasse'],
            where: { courriel: email }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Classe inexistante");
                }
                const num = classe.idclasse;
                const path = "./Classes/classe" + num + "/depot/" + matiere;
                verificationChemin(path)
                return res.status(200);
            });
    } else {
        console.log('soit pas une classe, soit pas la bonne classe : accès interdit')
        return res.status(403).send("Tentative de sauvegarde de cours d'un autre utilisateur")
    }
}


const saveCours = (req, res) => {
    const email = req.body.mail;
    const path = './Documents/' + email

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

    verificationChemin(path);

    // Vérification de si un fichier est unique dans son chemin, si ce n'est pas le cas, il lui attribue un nouveau nom
    let name = verifNom(path, nom);

    // Enregistrement du fichier en local sur le serveur
    fs.writeFile(path + "/" + name, file.buffer, 'utf8', function (err) {
        if (err) {
            console.log("Erreur lors de l'enregistrement du document : " + err);
            return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
        }
        console.log("Le fichier a bien été sauvegardé");
        return res.status(201).send("Enregistrement effectué");
    });

}


/**
 * Cette fonction permet de vérifier si le chemin donné en paramètre existe déjà, sinon crée les dossiers nécessaires
 * @param {String} pathToVerify le chemin à vérifier
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
            //return res.status(600).send("Erreur lors de la création de dossier pour le chemin" + path)
        }
    }
}

/**
 * Retourne le nom, changé si besoin pour qu'il soit unique lors de sa sauvegarde
 * @param {String} path le chemin où le fichier est sauvegardé
 * @param {String} nom le nom du fichier avant changement
 * @returns le nom unique du fichier
 */
function verifNom(path, nom) {
    // Vérification si un fichier est unique dans son chemin, si ce n'est pas le cas, il lui attribue un nouveau nom
    let name = nom;
    let isNotUnique = true;
    let i = 1;
    const newnom = name.split(".")[0]
    const extension = name.split(".")[1]

    while (isNotUnique) {
        try {
            if (fs.existsSync(path + "/" + name)) {
                // le nouveau nom sera de la forme : nom-x.type, avec x étant le nombre de fichiers ayant le même nom
                name = newnom + "-" + i + "." + extension
                i++;
            } else {
                isNotUnique = false
            }
        } catch (err) {
            console.log("Erreur verification nom " + err)
        }
    }
    return name;
}

module.exports = {
    saveCoursEleve,
    saveCoursClasse,
    addMatiereEleve,
    addMatiereClasse, 
    saveCours
}