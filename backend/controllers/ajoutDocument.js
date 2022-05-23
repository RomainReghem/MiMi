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
        attributes:['ideleve'],
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
            let name =verifNom(path, nom);
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
        .catch(err=>{
            console.log(err)
            return res.send(err).status(520)
        });
}

/**
 * Sauvegarde sur le serveur le document dont la matière est donné dans le dossier approprié.
 * 
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const saveCoursClasse = (req, res) => {
    console.log("\n*** Sauvegarde de cours d'une classe ***")
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
    Classe.findOne({
        attributes:['idclasse'],
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
            let name =verifNom(path, nom);
      
            fs.writeFile(path + "/" + name, file.buffer, 'utf8', function (err) {
                if (err) {
                    console.log("Erreur lors de l'enregistrement du document : " + err);
                    return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
                }
                console.log("Le fichier a bien été sauvegardé");
                return res.status(201).send("Enregistrement effectué");
            });
        })
        .catch(err=>{
            console.log(err)
            return res.send(err).status(520)
        });
}

/**
 * Ajoute dans les dossiers de l'élève donné la matière précisée
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const addMatiereEleve = (req, res) => {
    console.log("\n*** Ajout d'une matière ***")
    const email = req.query.mail;
    const matiere = req.query.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }

    Eleve.findOne({
        attributes:['ideleve'],
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
}

/**
 * Ajoute dans les dossiers de la classe donné la matière précisée
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const addMatiereClasse = (req, res) => {
    console.log("\n*** Ajout d'une matière dans la classe***")
    const email = req.query.mail;
    const matiere = req.query.matiere;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }

    Classe.findOne({
        attributes:['idclasse'],
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
        try{
            if (fs.existsSync(path + "/" + name)) {
                // le nouveau nom sera de la forme : nom-x.type, avec x étant le nombre de fichiers ayant le même nom
                name = newnom + "-" + i + "." + extension
                i++;
            } else {
                isNotUnique = false
            }
        }catch(err){
            console.log("Erreur verification nom "+err)
        }
    }
    return name;
}

module.exports = {
    saveCoursEleve,
    saveCoursClasse,
    addMatiereEleve,
    addMatiereClasse
}