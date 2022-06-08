const fs = require('fs');
const { verificationChemin } = require('./image');


const getFiles=(req, res)=>{
    console.log("\n*** Récupération des documents ***")
    const mailDossier = req.query.findMail;
    const path='./Documents/'+mailDossier;

    verificationChemin(path);

    fs.readdir(path,{ withFileTypes: true }, function (err, files) {
        if (err) {
            console.log("erreur durant la récupération " + err)
            return res.status(520).send("Erreur durant le récupération des fichiers !");
        } else {
            let f=[]
            // on n'affichera que les fichiers pdf
            for (file in files){
                console.log("-"+files[file].name)
                if (files[file].name.match("(.pdf|.PDF)$")) {
                    f.push(files[file].name)
                }
            }
            // on ne veut que les fichiers
           /* let files=fichiers.filter((dirent)=>dirent.isFile());
            for (f in files){
                console.log("-"+f)
            }*/
            return res.status(201).send({ files:f });
        }
    })
}


/**
 * Permet de retourner le contenu d'un fichier dont on a le nom et l'utilisateur
 * @param {*} req la requête du client,  contient le mail de l'utilisateur, le mail de la personne dont on veut accèder au document, le nom du document
 * @param {*} res la réponse du serveur, contient un code HTTP (erreur ou succès) et un message à envoyer au client
 * @returns la réponse du serveur : res
 */
const getFile=(req, res)=>{
    console.log("\n*** Récupération d'un document ***")
    const mailDossier = req.query.findMail;
    const name = req.query.name;
    console.log("nom du mail : "+mailDossier)

    let path='./Documents/'+mailDossier

    verificationChemin(path);
    
    path += "/"+name;
    if (fs.existsSync(path)) {
        fs.readFile(path, function (err, fichier) {
            if (err) {
                console.log("erreur lors de la recup de fichier " + err)
                return res.status(520).send(err)
            }
            console.log("Récupération ok")
            return res.status(201).send({ file: fichier });
        });
    } else {
        return res.status(404).send("Dossier inexistant")
    }
}


module.exports = {
    getFiles,
    getFile
}