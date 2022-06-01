const Eleve = require('../models/users').Eleve
const Classe = require('../models/users').Classe

const fs = require('fs');

/**
 * Retourne un fichier précis, selon la matière et le nom du fichier donné
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getCoursEleve = (req, res) => {
    console.log("\n*** Récupération d'un cours ***")
    const email = req.query.mail;
    const matiere =  "maths"//req.query.cours;
    const name = req.query.name;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }

    const emailToken = req.mail;
    const role = req.role;

    if (role == "eleve" && (emailToken != email)) {
        return res.status(403).send("Accès interdit")
    }

    Eleve.findOne({
        attributes: ['ideleve', 'invitation', 'idclasse'],
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere + "/" + name;

            if (role == "classe") {
                if (eleve.invitation == "acceptee") {
                    Classe.findOne({
                        attributes: ['idclasse'],
                        where: { courriel: emailToken }
                    })
                        .then(classe => {
                            if (!classe) {
                                return res.status(403).send('pas de classe correspondante : accès interdit')
                            }
                            if (classe.idclasse != eleve.idclasse) {
                                return res.status(403).send('Une autre classe essaie d\'accèder au fichier de l\'eleve : accès interdit')
                            }
                            if (fs.existsSync(path)) {
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
                            } else {
                                return res.status(404).send("Fichier inexistant")
                            }
                        })
                        .catch(err => {
                            console.log(err)
                            return res.send(err).status(520)
                        })
                } else {
                    return res.status(403).send('Aucune classe enregistree pour cet eleve : accès interdit')
                }
            } else {
                if (fs.existsSync(path)) {
                    fs.readFile(path, function (err, fichier) {
                        if (err) {
                            console.log("erreur lors de la recup de fichier " + err)
                            return res.status(520).send(err)
                        }
                        console.log("Récupération ok")
                        return res.send({ file: fichier });
                    });
                } else {
                    return res.status(404).send("Fichier inexistant")
                }
            }
        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
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
    const matiere =  "maths"//req.query.cours;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        // erreur 400
        return res.sendStatus(407)
    }

    const emailToken = req.mail;
    const role = req.role;

    if (role == "eleve" && (emailToken != email)) {
        return res.status(403).send("Accès interdit")
    }

    Eleve.findOne({
        attributes: ['ideleve', 'invitation', 'idclasse'],
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève inexistant");
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot/" + matiere + "/";
            // si c'est une classe on doit vérifier que la classe qui essaie d'accèder aux cours est bien celle de l'élève.
            if (role == "classe") {
                if (eleve.invitation == "acceptee") {
                    Classe.findOne({
                        attributes: ['idclasse'],
                        where: { courriel: emailToken }
                    })
                        .then(classe => {
                            if (!classe) {
                                return res.status(403).send('pas de classe correspondante : accès interdit')
                            }
                            if (classe.idclasse != eleve.idclasse) {
                                return res.status(403).send('Une autre classe essaie d\'accèder au fichier de l\'eleve : accès interdit')
                            }

                            //let list = []
                            if (fs.existsSync(path)) {
                                fs.readdir(path, function (err, files) {
                                    if (err) {
                                        console.log("erreur durant la récupération " + err)
                                        return res.status(520);
                                    } else {
                                        console.log("Récupération réussie")
                                        return res.send({ files }).status(201)
                                    }
                                })
                            } else {
                                return res.status(404).send("Dossier inexistant")
                            }
                        })
                        .catch(err => {
                            console.log(err)
                            return res.send(err).status(520)
                        });
                } else {
                    return res.status(403).send('Cet élève n\'a aucune classe : accès interdit')
                }
            } else {
                //let list = []
                if (fs.existsSync(path)) {
                    fs.readdir(path, function (err, files) {
                        if (err) {
                            console.log("erreur durant la récupération " + err)
                            return res.status(520);
                        } else {
                            console.log("Récupération réussie")
                            return res.send({ files }).status(201)
                        }
                    })
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            }
        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        })
}


/**
 * Retourne le nom de toutes les matières d'un élève
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllMatieresEleve = (req, res) => {
    console.log("\n*** Récupération des matières ***")
    const email = req.body.mail;

    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(400).send('Adresse courriel de forme incorrecte.')
    }

    const emailToken = req.mail;
    const role = req.role;

    if (role == "eleve" && (emailToken != email)) {
        return res.status(403).send("Accès interdit")
    }

    Eleve.findOne({
        attributes: ['ideleve', 'invitation', 'idclasse'],
        where: { courriel: email }
    })
        .then(eleve => {
            if (!eleve) {
                console.log("Utilisateur pas trouvé");
                return res.status(404).send("Élève pas trouvé")
            }
            const num = eleve.ideleve;
            const path = "./Eleves/eleve" + num + "/depot";
            if (role == "classe") {
                if (eleve.invitation == "acceptee") {
                    Classe.findOne({
                        attributes: ['idclasse'],
                        where: { courriel: emailToken }
                    })
                        .then(classe => {
                            if (!classe) {
                                return res.status(403).send('pas de classe correspondante : accès interdit')
                            }
                            if (classe.idclasse != eleve.idclasse) {
                                return res.status(403).send('Une autre classe essaie d\'accèder au fichier de l\'eleve : accès interdit')
                            }
                            if (fs.existsSync(path)) {
                                fs.readdir(path, function (err, folders) {
                                    if (err) {
                                        console.log("erreur durant la récupération " + err)
                                        return res.status(520);
                                    } else {
                                        return res.send({ matieres: folders }).status(201)
                                    }
                                })
                            } else {
                                return res.status(404).send("Dossier inexistant")
                            }
                        })
                        .catch(err => {
                            console.log(err)
                            return res.send(err).status(520)
                        })
                } else {
                    return res.status(403).send('Cet élève n\'a aucune classe : accès interdit')
                }
            } else {
                if (fs.existsSync(path)) {
                    fs.readdir(path, function (err, folders) {
                        if (err) {
                            console.log("erreur durant la récupération " + err)
                            return res.status(520);
                        } else {
                            return res.send({ matieres: folders }).status(201)
                        }
                    });
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            }
        })
        .catch(err => {
            console.log(err)
            return res.send(err).status(520)
        })
}


/**
 * Retourne un fichier précis, selon la matière et le nom du fichier donné, pour une classe
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getCoursClasse = (req, res) => {
    console.log("\n*** Récupération d'un cours d'une classe***")
    const id = req.query.id;
    const matiere =  "maths"//req.query.cours;
    const name = req.query.name;

    if (id == null) {
        return res.status(403).send("Accès interdit")
    }
    const emailToken = req.mail;
    const role = req.role;

    const path = "./Classes/classe" + id + "/depot/" + matiere + "/" + name;

    if (role == "eleve") {
        // on cherche parmi les eleves de la classe, celui qui a le mail donné
        // on vérifie également que l'id existe bien dans la table de la classe
        Eleve.findOne({
            attributes: ['invitation'],
            where: { courriel: emailToken, idclasse: id },
            include: [{
                model: Classe,
                attributes: [],
                where: {
                    idclasse: id
                }
            }]
        })
            .then(eleve => {
                if (!eleve) {
                    return res.status(404).send("Eleve inexistant");
                }
                if (eleve.invitation != "acceptee") {
                    return res.status(403).send("Accès interdit")
                }

                if (fs.existsSync(path)) {
                    fs.readFile(path, function (err, fichier) {
                        if (err) {
                            console.log("erreur lors de la recup de fichier " + err)
                            return res.status(520).send(err)
                        }
                        console.log("Récupération ok")
                        return res.send({ file: fichier });
                    });
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            })
    } else if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse', 'courriel'],
            where: {
                idclasse: id
            }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Classe inexistante");
                }
                if (emailToken != classe.courriel) {
                    return res.status(403).send("Accès interdit : utilisateur différent du propriétaire des fichiers")
                }
                if (fs.existsSync(path)) {
                    fs.readFile(path, function (err, fichier) {
                        if (err) {
                            console.log("erreur lors de la recup de fichier " + err)
                            return res.status(520).send(err)
                        }
                        console.log("Récupération ok")
                        return res.send({ file: fichier });
                    });
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            })
    } else {
        console.log("Role %s inconnu ", role)
        return res.status(403).send("Accès interdit")
    }
}


/**
 * Retourne le nom de tous les fichiers concernant une matière donnée, pour une classe
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllCoursClasse = (req, res) => {
    console.log("\n*** Récupération des cours d'une classe pour une matiere***")
    const id = req.query.id;
    const matiere =  "maths"//req.query.cours;

    if (id == null) {
        return res.status(403).send("Accès interdit")
    }
    const emailToken = req.mail;
    const role = req.role;

    const path = "./Classes/classe" + id + "/depot/" + matiere + "/";

    if (role == "eleve") {
        // on cherche parmi les eleves de la classe, celui qui a le mail donné
        // on vérifie également que l'id existe bien dans la table de la classe
        Eleve.findOne({
            attributes: ['invitation'],
            where: { courriel: emailToken, idclasse: id },
            include: [{
                model: Classe,
                attributes: [],
                where: {
                    idclasse: id
                }
            }]
        })
            .then(eleve => {
                if (!eleve) {
                    return res.status(404).send("Eleve inexistant");
                }
                if (eleve.invitation != "acceptee") {
                    return res.status(403).send("Accès interdit")
                }
                if (fs.existsSync(path)) {
                    fs.readdir(path, function (err, files) {
                        if (err) {
                            console.log("erreur durant la récupération " + err)
                            return res.status(520);
                        } else {
                            return res.send({ files }).status(201)
                        }
                    })
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            })

    } else if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse'],
            where: { idclasse: id }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Classe inexistante");
                }
                if (fs.existsSync(path)) {
                    fs.readdir(path, function (err, files) {
                        if (err) {
                            console.log("erreur durant la récupération " + err)
                            return res.status(520);
                        } else {
                            return res.send({ files }).status(201)
                        }
                    })
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            })
    } else {
        console.log("Role %s inconnu ", role)
        return res.status(403).send("Accès interdit")
    }
}


/**
 * Retourne le nom de toutes les matières d'un élève
 * @param {*} req la requête du client
 * @param {*} res la réponse du serveur
 */
const getAllMatieresClasse = (req, res) => {
    console.log("\n*** Récupération des matières de la classe ***")
    const id = req.query.id;

    if (id == null) {
        return res.status(403).send("Accès interdit")
    }
    const emailToken = req.mail;
    const role = req.role;

    const path = "./Classes/classe" + id + "/depot";

    if (role == "eleve") {
        // on cherche parmi les eleves de la classe, celui qui a le mail donné
        // on vérifie également que l'id existe bien dans la table de la classe
        Eleve.findOne({
            attributes: ['invitation'],
            where: { courriel: emailToken, idclasse: id },
            include: [{
                model: Classe,
                attributes: [],
                where: {
                    idclasse: id
                }
            }]
        })
            .then(eleve => {
                if (!eleve) {
                    return res.status(404).send("Eleve inexistant");
                }
                if (eleve.invitation != "acceptee") {
                    return res.status(403).send("Accès interdit")
                }
                if (fs.existsSync(path)) {
                    fs.readdir(path, function (err, folders) {
                        if (err) {
                            console.log("erreur durant la récupération " + err)
                            return res.status(520);
                        } else {
                            return res.json({ matieres: folders })
                        }
                    })
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            })
    } else if (role == "classe") {
        Classe.findOne({
            attributes: ['idclasse'],
            where: { idclasse: id }
        })
            .then(classe => {
                if (!classe) {
                    console.log("Utilisateur pas trouvé");
                    return res.status(404).send("Classe pas trouvée")
                }
                if (fs.existsSync(path)) {
                    fs.readdir(path, function (err, folders) {
                        if (err) {
                            console.log("erreur durant la récupération " + err)
                            return res.status(520);
                        } else {
                            return res.json({ matieres: folders })
                        }
                    })
                } else {
                    return res.status(404).send("Dossier inexistant")
                }
            })
            .catch(err => {
                console.log(err)
                return res.send(err).status(520)
            })
    } else {
        console.log("Role %s inconnu ", role)
        return res.status(403).send("Accès interdit")
    }
}


module.exports = { getAllCoursEleve, getAllMatieresEleve, getCoursEleve, getAllCoursClasse, getAllMatieresClasse, getCoursClasse }