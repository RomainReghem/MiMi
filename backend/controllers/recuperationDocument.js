const fs = require('fs');
const { verificationChemin } = require('./ajoutDocument');


/**
 * Renvoie au format json la liste des fichiers pdf de l'utilisateur spécifié
 * La vérification des droits d'accès se fait avant 
 * @param {*} req la requête du client, on se sert de 'findMail', qui est le mail de l'utilisateur dont on veut avoir la liste de fichiers
 * @param {*} res la réponse du serveur, composé d'un code http (erreur ou succès),et soit d'un message d'erreur, soit la liste des noms des fichiers
 */
const getFiles = (req, res) => {
    //console.log("\n*** Récupération des documents ***")
    //console.log("recuperationDocument.js => getFiles")
    const mailDossier = req.query.findMail;
    const path = './Documents/' + mailDossier;

    try {
        verificationChemin(path);

    } catch (err) {
        console.log("Err controllers/recuperationDocument.js > getFiles : erreur verifchemin " + err)
        return res.status(520).send(err);

    }
    fs.readdir(path, { withFileTypes: true }, function (err, files) {
        if (err) {
            console.log("Err controllers/recuperationDocument.js > getFiles : readdir " + err)
            return res.status(520).send("Erreur durant le récupération des fichiers !");
        } else {
            let f = []
            // on n'affichera que les fichiers pdf
            for (file in files) {
                console.log("-" + files[file].name)
                if (files[file].name.match("(.pdf|.PDF)$")) {
                    f.push(files[file].name)
                }
            }

            return res.status(201).send({ files: f });
        }
    });
}


/**
 * Permet de retourner le contenu d'un fichier dont on a le nom et l'utilisateur
 * @param {*} req la requête du client,  contient le mail de l'utilisateur, le mail de la personne dont on veut accèder au document, le nom du document
 * @param {*} res la réponse du serveur, contient un code HTTP (erreur ou succès) et un message à envoyer au client
 * @returns la réponse du serveur : res
 */
const getFile = (req, res) => {
    // console.log("\n*** Récupération d'un document ***")
    //console.log("recuperationDocument.js => getFile")
    const mailDossier = req.query.findMail;
    const name = req.query.name;
    // console.log("nom du mail : " + mailDossier)

    let path = './Documents/' + mailDossier

    try {
        verificationChemin(path);
    } catch (err) {
        console.log("Err controllers/recuperationDocument.js > getFile : verif chemin : " + err)
        return res.status(520).send(err);
    }
    path += "/" + name;
    if (fs.existsSync(path)) {
        fs.readFile(path, function (err, fichier) {
            if (err) {
                console.log("Err controllers/recuperationDocument.js > getFiles : readFile " + err)
                return res.status(520).send(err)
            }
            //console.log("Récupération ok")
            return res.status(201).send({ file: fichier });
        });
    } else {
        console.log("Err controllers/recuperationDocument.js > getFiles : rien trouvé au chemin %s", path)
        return res.status(404).send("Dossier inexistant")
    }
}


module.exports = {
    getFiles,
    getFile
}