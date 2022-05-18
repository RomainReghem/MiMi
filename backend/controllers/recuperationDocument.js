const Eleve = require('../models/users').Eleve

const fs = require('fs');

/**
 * Retourne le nom de toutes les matières d'un élève
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllMatieresEleve = (req, res) => {
    console.log("\n*** Récupération des matières ***")
    const email = req.body.mail;

    Eleve.findOne({
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot";
            fs.readdir(path, function (err, folders) {
                if (err) {
                    console.log("erreur durant la récupération " + err)
                    return res.status(520);
                } else {
                    return res.json({ matieres: folders })
                }
            })
        })
}

/**
 * Retourne le nom de tous les fichiers concernant une matiére donnée, pour un élève
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllCoursEleve = (req, res) => {
    console.log("\n*** Récupération des cours d'une matiere***")
    const email = req.query.mail;
    const matiere = req.query.cours;
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
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere + "/";
            //let list = []
            fs.readdir(path, function (err, files) {
                if (err) {
                    console.log("erreur durant la récupération " + err)
                    return res.status(520);
                } else {
                    return res.send({ files }).status(201)
                }
            })
        })
}

/**
 * Retourne un fichier précis, selon la matière et le nom du fichier donné
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getCoursEleve = (req, res) => {
    console.log("\n*** Récupération d'un cours ***")
    const email = req.query.mail;
    const matiere = req.query.cours;
    const name = req.query.name;

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
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere + "/" + name;

            fs.readFile(path, function (err, fichier) {
                if (err) {
                    console.log("erreur lors de la recup de fichier " + err)
                    return res.status(520).send(err)
                }
                /*res.writeHead(200, { 'Content-Type': 'application/pdf' });
                res.write(fichier);

                return res.end();*/
                console.log("Récupération ok")

                return res.send({ file: fichier });
            });
        })
}

module.exports = { getAllCoursEleve, getAllMatieresEleve, getCoursEleve }