const Score = require('../models/users').Score
const Eleve = require('../models/users').Eleve
const Classe = require('../models/users').Classe


/**
 * Remet à 0 le score de l'élève donné pour le score du jeu donné. 
 * @param {*} req la requête du client, doit contenir :  
 * • le mail de l'élève : mail  
 * • le nom du jeu : game
 * @param {*} res la réponse que renvoie le serveur, contient un code http et éventuellement un message précisant l'erreur/le succès
 * @returns la réponse du serveur
 */
const resetScore = (req, res) => {
    // console.log('\n*** Remise à zéro du score ***')
    const email = req.query.mail;
    const jeu = "tictactoe"//req.query.game;

    // console.log("** Vérification mail **")
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("Err controllers/score.js > resetScore : forme mail incorrect")
        return res.sendStatus(407)
    }
    //console.log("** Vérification jeu **")
    if (jeu != 'tictactoe') {
        console.log("Err controllers/score.js > resetScore : jeu inconnu")
        return res.status(400).send('Jeu %s inconnu', jeu)
    }

    // console.log("** Vérification droit d'accès au score **")
    const role = req.role;
    const emailToken = req.mail

    if (email == emailToken) {
        if (role == "eleve") {
            // on recupere l'id de l'eleve à partir de son mail
            Eleve.findOne(
                {
                    attributes: ['idclasse', 'invitation'],
                    where: { courriel: email }
                }
            ).then(eleve => {
                if (!eleve) {
                    console.log("Err controllers/score.js > resetScore : eleve pas trouve avec l'addresse : " + email)
                    return res.status(404).send("Pas de compte correspondant à cette addresse.\nElève non trouvé");
                } else if ("acceptee" != eleve.invitation) {
                    console.log("Err controllers/score.js > resetScore : cet élève n'est pas dans une classe ! " + email)
                    return res.status(409).send("Vous n'appartenez à aucune classe");
                }
                Score.findOne(
                    { attributes: ['idscore'], where: { idclasse: eleve.idclasse, jeu: jeu } }
                ).then(score => {
                    if (!score) {
                        console.log("Err controllers/score.js > resetScore : pas de score trouvé pour le jeu %s et l'élève %s", jeu, email)
                        return res.status(404).send("Pas de score correspondant à ce jeu et cet élève.\nScore non trouvé");
                    }
                    //console.log("** Début de la suppression des données **")
                    // on met toutes les données à zéro
                    Score.update(
                        { scoreclasse: 0, scoreeleves: 0, nbpartie: 0 },
                        { where: { idscore: score.idscore } })
                        .then(() => {
                            //console.log("Mise à 0 du score réussie !")
                            return res.status(201).send("Le score a bien été réinitialisé !")
                        })
                        .catch(err => {
                            console.log("Err controllers/score.js > resetScore : score update " + err)
                            return res.status(500).send("Erreur suppression score.");
                        });
                    return res.send({ score: score.score, win: score.victoire, loss: score.defaite, nbpartie: score.nbpartie }).status(201)
                }).catch(err => {
                    console.log("Err controllers/score.js > resetScore : score findone " + err)
                    return res.status(500).send("Erreur récuperation score \n" + err);
                });
            }).catch(err => {
                console.log("Err controllers/score.js > resetScore : elevefindone " + err)
                return res.status(500).send("Erreur récuperation compte eleve \n" + err);
            });
        } else if (role == "classe") {
            Classe.findOne({
                attributes: ['idclasse'],
                where: { courriel: email }
            }).then(classe => {
                if (!classe) {
                    console.log("Err controllers/score.js > resetScore : Classe pas trouvée avec l'addresse : " + email)
                    return res.send("Pas de compte correspondant à cette addresse.\nClasse non trouvée").status(404);
                }
                // on récupère le score de la classe
                getScore(classe.idclasse, "tictactoe", function (err, data) {
                    if (err) {
                        return res.status(520).send(err)
                    }
                    // on ajoute d'abord le nouveau score
                    Score.update({ scoreclasse: 0, scoreeleves: 0, nbpartie: 0 },
                        { where: { idclasse: classe.idclasse } })
                        .then(() => {
                            return res.status(201).send("Réinitialisation du score effectué avec succès !")
                        })
                        .catch(err => {
                            console.log("Err controllers/score.js > resetScore : score update " + err)
                            return res.status(500).send("Erreur changement score.");
                        });
                })
            }).catch(err => {
                console.log("Err controllers/score.js > resetScore : classe findOne " + err)
                return res.status(500).send("Erreur récuperation compte classe \n" + err);
            });
        } else {
            console.log("Err controllers/score.js > resetScore : role impossible " + role)
            return res.sendStatus(418)
        }
    } else {
        console.log("Err controllers/score.js > resetScore : tentative de reinitialisation du score d'un compte par " + emailToken)
        return res.status(403).send("Accès interdit : tentative de suppression du score d'un eleve")
    }
}


/**
 * Retourne au client le score de l'utilisateur précisé  et de son adversaire au tic-tac-toe.
 * Si l'utilisateur n'a jamais joué, insère une nouvelle ligne dans la base de données.
 * @param {*} req la requête du client contient :  
 * • l'email de l'utilisateur dont on veut le score au tictactoe (cela peut être un élève ou une classe)
 * @param {*} res la réponse du serveur, une erreur ou bien le score
 * @returns la réponse du serveur.
 */
const getScoreTicTacToe = (req, res) => {
    console.log("\n*** Récupération du score ***");
    console.log("get score : " + (Date.now()) / 1000)
    const email = req.query.mail;

    console.log("** Vérification mail **")
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.status(400).send("Le mail n'est pas la bonne forme.")
    }

    console.log("** Vérification droit d'accès au score **")
    const emailToken = req.mail
    const role = req.role;

    if (email == emailToken) {
        if (role == "eleve") {
            Eleve.findOne({ attributes: ['idclasse', 'invitation'], where: { courriel: email } })
                .then(eleve => {
                    if (!eleve) {
                        console.log("eleve pas trouve avec l'addresse : " + email)
                        return res.status(404).send("Pas de compte correspondant à cette addresse.\nElève non trouvé");
                    } else if (eleve.invitation != "acceptee") {
                        console.log("Cet élève n'est pas dans une classe ! " + email)
                        return res.status(403).send("Cet élève n'est pas dans une classe ! ");
                    } else {
                        getScore(eleve.idclasse, "tictactoe", function (err, data) {
                            if (err) {
                                return res.status(409).send(err)
                            }
                            console.log("%i à %i pour l'élève, nombre de parties jouées %i", data.scoreeleves, data.scoreclasse, data.nbpartie)
                            return res.status(201).json({ scores: [data.scoreeleves, data.scoreclasse], partie: data.nbpartie })
                        })
                    }
                }).catch(err => {
                    console.log("Erreur récuperation compte eleve \n" + err)
                    return res.status(500).send("Erreur lors de la récuperation du compte eleve");
                });

        } else if (role == "classe") {
            console.log("changement de la classe")
            Classe.findOne({
                attributes: ['idclasse'],
                where: { courriel: email }
            }).then(classe => {
                if (!classe) {
                    console.log("Classe pas trouvée avec l'addresse : " + email)
                    return res.status(404).send("Pas de compte correspondant à cette addresse.\nClasse non trouvée");
                }
                // on récupère le score de la classe
                getScore(classe.idclasse, "tictactoe", function (err, data) {
                    if (err) {
                        return res.status(520).send(err)
                    }
                    console.log("%i à %i pour la classe, nombre de parties jouées %i", data.scoreclasse, data.scoreeleves, data.nbpartie)
                    return res.status(200).json({ scores: [data.scoreeleves, data.scoreclasse], partie: data.nbpartie })
                })
            }).catch(err => {
                console.log("Erreur classe findone " + err)
                return res.status(500).send("Erreur récuperation compte classe.");
            });

        } else {
            console.log("What's this role ? %s", role)
            return res.sendStatus(418)
        }
    } else {
        console.log("Tentative de changement de score interdite !")
        return res.status(403).send("Accès interdit : tentative de changement du score")
    }
}


/**
 * Renvoie dans une fonction callback le score d'un jeu joué avec une classe spécifiée.  
 * Si aucun score n'existe pour le jeu et la classe, alors le crée.
 * @param {number} id l'identifiant unique de la classe
 * @param {String} jeu le nom du jeu dont on veut récupérer le score
 * @param {*} callback la fonction callback, retourne s'il y en a une erreur, ou alors le score trouvé
 */
function getScore(id, jeu, callback) {
    Score.findOne(
        {
            attributes: ['scoreclasse', 'scoreeleves', 'nbpartie'],
            where: { idclasse: id, jeu: jeu }
        }
    ).then(score => {
        if (!score) {
            //console.log("pas de score pour le jeu trouvé : création du score ")
            Score.create({ jeu: jeu, idclasse: id })
                .then(newscore => {
                    //console.log("Création du score effectuée");
                    return callback(null, newscore);
                })
                .catch(err => {
                    console.log("Err controllers/score.js > getScore : serveur creation des données pour le jeu \n" + err)
                    return callback("Erreur du serveur lors de la creation des données pour le jeu");
                });
        } else {
            // on renvoie le score
            return callback(null, score)
        }
    }).catch(err => {
        console.log("Err controllers/score.js > getScore : récuperation score \n" + err)
        return callback("Erreur lors de la récupération du score.");
    });
}


/**
 * Ajoute des points au score au tictactoe de l'adresse fournie
 * @param {String} email l'adresse du gagnant de la partie, cela peut être une classe ou un élève
 */
async function addVictory(email) {
    if (email != undefined) {
        // console.log('\n***Ajout de point***')
        //console.log("addPoints : " + (Date.now()) / 1000)
        try {
            const eleve = await Eleve.findOne({ attributes: ["idclasse"], where: { courriel: email } })
            if (!eleve) {
                const classe = await Classe.findOne({ attributes: ["idclasse"], where: { courriel: email } });
                if (!classe) {
                    console.log("Err controllers/score.js > addVictory : pas de classe")
                    throw new Error("Aucun utilisateur trouvé avec ce mail %s !", email)
                }
                await Score.increment({ scoreclasse: +1, nbpartie: +1 }, { where: { idclasse: classe.idclasse } })
                // console.log("ajout de point pour la classe %s", email)
            } else {
                await Score.increment({ scoreeleves: +1, nbpartie: +1 }, { where: { idclasse: eleve.idclasse } })
                //console.log("ajout de point pour l'eleve %s", email)
            }
        } catch (error) {
            console.log("Err controllers/score.js > addVictory : erreur lors des requetes " + error)
            throw new Error("Erreur lors du changement du score.")
        }
    }
}


/**
 * A l'instar de la fonction addVictory, incrémente de un le nombre de partie jouée. 
 * Cette fonction est appelée seulement quand aucun des deux joueurs n'a gagné
 * @param {String} email le mail du deuxième joueur
 */
async function addPartie(email) {
    if (email != undefined) {
        //console.log('\n***Augmentation du nombre de partie***')
        //console.log("addPartie : " + (Date.now()) / 1000)
        try {
            const eleve = await Eleve.findOne({ attributes: ["idclasse"], where: { courriel: email } })
            if (!eleve) {
                const classe = await Classe.findOne({ attributes: ["idclasse"], where: { courriel: email } });
                if (!classe) {
                    console.log("Err controllers/score.js > resetScore : aucun utilisateur trouvé avec ce mail %s !", email);
                    throw new Error("Aucun utilisateur trouvé avec ce mail %s !", email)
                }
                await Score.increment({ nbpartie: +1 }, { where: { idclasse: classe.idclasse } })
                //console.log("ajout de partie classe ok")
            } else {
                await Score.increment({ nbpartie: +1 }, { where: { idclasse: eleve.idclasse } })
                //console.log("ajout de partie pour l'élève ok")
            }
        } catch (err) {
            console.log("Err controllers/score.js > resetScore : addPartie " + err)
            throw new Error("Erreur durant l'ajout du nombre de partie");
        }
    }
}


module.exports = {
    getScoreTicTacToe,
    addVictory,
    //resetScore,
    addPartie
}