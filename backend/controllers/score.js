const Score = require('../models/users').Score
const Eleve = require('../models/users').Eleve
const Classe = require('../models/users').Classe

// /**
//  * Change le score du jeu donné pour l'élève donné.
//  * Si pour l'élève donné, aucun score n'est trouvé, crée les données de score du jeu dans la base de données
//  * @param {*} req la requête du client, doit contenir :  
//  * • le mail de l'élève : mail  
//  * • le nom du jeu : game  
//  * • la victoire ainsi que la défaite de l'élève : win et loss  
//  * • les points qu'a gagné l'élève : gain  
//  * @param {*} res la réponse que renvoie le serveur, contient un code http et éventuellement un message précisant l'erreur/le succès
//  * @returns la réponse du serveur
//  */
// const changeScore = (req, res) => {
//     console.log("\n*** Changement de score ***")
//     const email = req.body.mail;
//     const win = req.body.win;

//     const gain = req.body.gain;
//     const jeu = req.body.game;
//     const loss = req.body.loss;

//     // en cas d'égalité, win et loss seront à zéro
//     if (win != 0 || win != 1 || loss != 0 || loss != 1 || (loss != Math.abs(win - 1) && loss != 0)) {
//         return res.send("La victoire/perte n'est pas sous la bonne forme : on recoit victoire %s et defaite %s ", win, loss).status(400)
//     }

//     console.log("** Vérification mail **")
//     if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
//         console.log("forme mail incorrect")
//         return res.sendStatus(407)
//     }
//     console.log("** Vérification jeu **")
//     if (jeu != 'tictactoe') {
//         console.log("jeu inconnu " + jeu)
//         return res.send('Jeu "%s" inconnu', jeu).status(400)
//     }
//     console.log("** Vérification du score **")
//     if ((win == 1 && gain != 10) || (win == 0 && gain != 0)) {
//         console.log("pas bon score " + gain);
//         return res.send('Le score donné n\'est pas de la bonne forme').status(400)
//     }

//     console.log("** Vérification droit d'accès au score **")
//     const role = req.role;
//     const emailToken = req.mail
//     // seul un eleve peut accèder à son propre score
//     if (role == "eleve" && email == emailToken) {
//         // on recupere l'id de l'eleve à partir de son mail
//         Eleve.findOne(
//             {
//                 attributes: ['ideleve'],
//                 where: { courriel: email }
//             }
//         ).then(eleve => {
//             if (!eleve) {
//                 console.log("eleve pas trouve avec l'addresse : " + email)
//                 return res.send("Pas de compte correspondant à cette addresse.\nElève non trouvé").status(404);
//             }
//             Score.findOne(
//                 { attributes: ['idscore', 'score', 'victoire', 'defaite', 'nbpartie'], where: { ideleve: eleve.ideleve, jeu: jeu } }
//             ).then(score => {
//                 if (!score) {
//                     console.log("pas de score pour le jeu trouvé : création des données pour le jeu ")
//                     Score.create({ jeu: jeu, ideleve: eleve.ideleve, victoire: win, defaite: loss, score: gain })
//                         .then(() => {
//                             console.log("Création du score effectuée");
//                             return res.status(201).send("Création du score effectuée");
//                         })
//                         .catch(err => {
//                             return res.status(500).send("Erreur serveur creation des données pour le jeu \n" + err);
//                         });
//                 }
//                 console.log("**Changement du score**")
//                 // on change le nombre de partie jouée, de victoire, de defaite et le score
//                 Score.update(
//                     { score: score.score + gain, victoire: score.victoire + win, perte: score.defaite + loss, nbpartie: score.nbpartie + 1 },
//                     { where: { idscore: score.idscore } }
//                 ).then(() => {
//                     console.log("Mise à jour du score réussie !")
//                     return res.sendStatus(201)
//                 })
//                     .catch(err => {
//                         return res.status(500).send("Erreur changement score \n" + err);
//                     });
//             }).catch(err => {
//                 return res.status(500).send("Erreur recuperation score \n" + err);
//             });
//         }).catch(err => {
//             return res.status(500).send("Erreur recuperation compte eleve \n" + err);
//         });
//     } else {
//         console.log("Tentative de changement du score d'un eleve !")
//         return res.status(403).send("Accès interdit : tentative de changement du score d'un eleve")
//     }
//     return res.sendStatus(418)
// }


// /**
//  * Change le score du jeu donné pour l'élève donné. 
//  * Si pour un élève existant, aucune données sur le jeu n'existe, crée les données 
//  * @param {*} req la requête du client, doit contenir :  
//  * • le mail de l'élève : mail  
//  * • le nom du jeu : game
//  * @param {*} res la réponse que renvoie le serveur, contient un code http et éventuellement un message précisant l'erreur/le succès
//  * @returns la réponse du serveur
//  */
// const returnScore = (req, res) => {
//     console.log('\n*** Récupération de score ***')
//     const email = req.query.mail;
//     const jeu = req.query.game;

//     console.log("** Vérification mail **")
//     if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
//         console.log("forme mail incorrect")
//         return res.sendStatus(407)
//     }
//     console.log("** Vérification jeu **")
//     if (jeu != 'tictactoe') {
//         console.log("jeu inconnu")
//         return res.send('Jeu inconnu').status(400)
//     }

//     console.log("** Vérification droit d'accès au score **")
//     const role = req.role;
//     const emailToken = req.mail
//     // seul un eleve peut accèder à son propre score
//     if (role == "eleve" && email == emailToken) {
//         // on recupere l'id de l'eleve à partir de son mail
//         Eleve.findOne(
//             {
//                 attributes: ['ideleve'],
//                 where: { courriel: email }
//             }
//         ).then(eleve => {
//             if (!eleve) {
//                 console.log("eleve pas trouve avec l'addresse : " + email)
//                 return res.send("Pas de compte correspondant à cette addresse.\nElève non trouvé").status(404);
//             }
//             Score.findOne(
//                 { attributes: ['score', 'victoire', 'defaite', 'nbpartie'], where: { ideleve: eleve.ideleve, jeu: jeu } }
//             ).then(score => {
//                 if (!score) {
//                     console.log("pas de score pour le jeu trouvé : création du score ")
//                     Score.create({ jeu: jeu, ideleve: eleve.ideleve })
//                         .then(() => {
//                             console.log("Création du score effectuée");
//                             return res.send({ score: 0, win: 0, loss: 0, nbpartie: 0 }).status(201)
//                         })
//                         .catch(err => {
//                             return res.status(500).send("Erreur serveur creation des données pour le jeu \n" + err);
//                         });
//                 }
//                 console.log("recupération des données de %s effectuées ! ", jeu)
//                 return res.send({ score: score.score, win: score.victoire, loss: score.defaite, nbpartie: score.nbpartie }).status(201)
//             }).catch(err => {
//                 return res.status(500).send("Erreur recuperation score \n" + err);
//             });
//         }).catch(err => {
//             return res.status(500).send("Erreur recuperation compte eleve \n" + err);
//         });
//     } else {
//         console.log("Tentative d'accès au score d'un eleve !")
//         return res.status(403).send("Accès interdit : tentative d'accès au score d'un eleve")
//     }
// }


// // /**
//  * Remet à 0 le score de l'élève donné pour le score du jeu donné. 
// * * @param {*} req la requête du client, doit contenir :  
//  * • le mail de l'élève : mail  
//  * • le nom du jeu : game
//  * @param {*} res la réponse que renvoie le serveur, contient un code http et éventuellement un message précisant l'erreur/le succès
//  * @returns la réponse du serveur
//  */
// const resetScore = (req, res) => {
//     console.log('\n*** Suppression de score ***')
//     const email = req.query.mail;
//     const jeu = req.query.game;

//     console.log("** Vérification mail **")
//     if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
//         console.log("forme mail incorrect")
//         return res.sendStatus(407)
//     }
//     console.log("** Vérification jeu **")
//     if (jeu != 'tictactoe') {
//         console.log("jeu inconnu")
//         return res.send('Jeu inconnu').status(400)
//     }

//     console.log("** Vérification droit d'accès au score **")
//     const role = req.role;
//     const emailToken = req.mail
//     // seul un eleve peut supprimer son propre score
//     if (role == "eleve" && email == emailToken) {
//         // on recupere l'id de l'eleve à partir de son mail
//         Eleve.findOne(
//             {
//                 attributes: ['ideleve'],
//                 where: { courriel: email }
//             }
//         ).then(eleve => {
//             if (!eleve) {
//                 console.log("eleve pas trouve avec l'addresse : " + email)
//                 return res.send("Pas de compte correspondant à cette addresse.\nElève non trouvé").status(404);
//             }
//             Score.findOne(
//                 { attributes: ['idscore'], where: { ideleve: eleve.ideleve, jeu: jeu } }
//             ).then(score => {
//                 if (!score) {
//                     console.log("pas de score trouvé pour le jeu %s et l'élève %s", jeu, email)
//                     return res.send("Pas de score correspondant à ce jeu et cet élève.\nScore non trouvé").status(404);
//                 }
//                 console.log("** Début de la suppression des données **")
//                 // on met toutes les données à zéro
//                 Score.update(
//                     { score: 0, victoire: 0, perte: 0, nbpartie: 0 },
//                     { where: { idscore: score.idscore } }
//                 ).then(() => {
//                     console.log("Mise à 0 du score réussie !")
//                     return res.sendStatus(201)
//                 })
//                     .catch(err => {
//                         return res.status(500).send("Erreur suppression score \n" + err);
//                     });
//                 return res.send({ score: score.score, win: score.victoire, loss: score.defaite, nbpartie: score.nbpartie }).status(201)
//             }).catch(err => {
//                 return res.status(500).send("Erreur récuperation score \n" + err);
//             });
//         }).catch(err => {
//             return res.status(500).send("Erreur récuperation compte eleve \n" + err);
//         });
//     } else {
//         console.log("Tentative de suppression du score d'un eleve !")
//         return res.status(403).send("Accès interdit : tentative de suppression du score d'un eleve")
//     }
// }

const getScoreTicTacToe = (req, res) => {
    console.log("\n*** Récupération du score ***");
    const email = req.query.mail;

    console.log("** Vérification mail **")
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(400)
    }

    console.log("** Vérification droit d'accès au score **")
    const emailToken = req.mail
    const role = req.role;

    console.log(" email : " + email)

    if (email == emailToken) {
        if (role == "eleve") {
            Eleve.findOne({ attributes: ['idclasse', 'invitation'], where: { courriel: email} })
                .then(eleve => {
                    if (!eleve) {
                        console.log("eleve pas trouve avec l'addresse : " + email)
                        return res.send("Pas de compte correspondant à cette addresse.\nElève non trouvé").status(404);
                    }else if(eleve.invitation!="acceptee"){
                        console.log("Cet élève n'est pas dans une classe ! " + email)
                        return res.sendStatus(409);
                    }
                    getScore(eleve.idclasse, "tictactoe", function (err, data) {
                        if (err) {
                            return res.send(err).status(409)
                        }
                        return res.json({ scores: [data.scoreeleves, data.scoreclasse] })
                    })
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
                    return res.send("Pas de compte correspondant à cette addresse.\nClasse non trouvée").status(404);
                }
                // on récupère le score de la classe
                getScore(classe.idclasse, "tictactoe", function (err, data) {
                    if (err) {
                        return res.send(err).status(520)
                    }
                    return res.json({ scores: [data.scoreeleves, data.scoreclasse] })
                })
            }).catch(err => {
                return res.status(500).send("Erreur récuperation compte classe \n" + err);
            });

        } else {
            return res.sendStatus(418)
        }

    } else {
        console.log("Tentative de changement de score interdite !")
        return res.status(403).send("Accès interdit : tentative de changement du score")
    }
}

const putScoreTicTacToe = (req, res) => {
    console.log("\n*** Enregistrement du score ***");
    const email = req.body.mail;
    const win = req.body.win;
    //const loss = !win;
    console.log("** Vérification mail **")
    if (!(email.match("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")) || 100 <= email.length) {
        console.log("forme mail incorrect")
        return res.sendStatus(400)
    }

    console.log("** Vérification droit d'accès au score **")
    const emailToken = req.mail
    const role = req.role;

    console.log("win : " + win + " email : " + email)
    let gain = 0;
    if (win == true) {
        gain = 1;
    } else if (win == false) {
        gain = 0;
    } else {
        console.log("nombre de parties gagnées incorrect")
        return res.sendStatus(400)
    }

    if (email == emailToken) {
        if (role == "eleve") {
           
            console.log("changement de l'eleve")
            Eleve.findOne({ attributes: ['idclasse'], where: { courriel: email, invitation: "acceptee" } })
                .then(eleve => {
                    if (!eleve) {
                        console.log("eleve pas trouve avec l'addresse : " + email)
                        return res.send("Pas de compte correspondant à cette addresse.\nElève non trouvé").status(404);
                    }
                    getScore(eleve.idclasse, "tictactoe", function (err, data) {
                        if (err) {
                            return res.send(err).status(409)
                        }
                        // on ajoute d'abord le nouveau score
                        Score.update({ scoreeleves: data.scoreeleves + gain },
                            { where: { idclasse: eleve.idclasse } })
                            .then(() => {
                                return res.json({ scores: [data.scoreeleves + gain, data.scoreclasse] })
                            })
                            .catch(err => {
                                return res.status(500).send("Erreur changement score \n" + err);
                            });
                    })
                }).catch(err => {
                    return res.status(500).send("Erreur récuperation compte eleve \n" + err);
                });

        } else if (role == "classe") {
            console.log("changement de la classe")
            Classe.findOne({
                attributes: ['idclasse'],
                where: { courriel: email }
            }).then(classe => {
                if (!classe) {
                    console.log("Classe pas trouvée avec l'addresse : " + email)
                    return res.send("Pas de compte correspondant à cette addresse.\nClasse non trouvée").status(404);
                }
                // on récupère le score de la classe
                getScore(classe.idclasse, "tictactoe", function (err, data) {
                    if (err) {
                        return res.send(err).status(520)
                    }
                    // on ajoute d'abord le nouveau score
                    Score.update({ scoreclasse: data.scoreclasse + gain, nbpartie: data.nbpartie + 1},
                        { where: { idclasse: classe.idclasse } })
                        .then(() => {
                            return res.json({ scores: [data.scoreeleves, data.scoreclasse + gain] })
                        })
                        .catch(err => {
                            return res.status(500).send("Erreur changement score \n" + err);
                        });
                })
            }).catch(err => {
                return res.status(500).send("Erreur récuperation compte classe \n" + err);
            });

        } else {
            return res.sendStatus(418)
        }

    } else {
        console.log("Tentative de changement de score interdite !")
        return res.status(403).send("Accès interdit : tentative de changement du score")
    }
}

function getScore(id, jeu, callback) {
    Score.findOne(
        {
            attributes: ['scoreclasse', 'scoreeleves', 'nbpartie'],
            where: { idclasse: id, jeu: jeu }
        }
    ).then(score => {
        if (!score) {
            console.log("pas de score pour le jeu trouvé : création du score ")
            Score.create({ jeu: jeu, idclasse: id })
                .then(newscore => {
                    console.log("Création du score effectuée");
                    return callback(null, newscore);
                })
                .catch(err => {
                    console.log("Erreur serveur creation des données pour le jeu \n" + err)
                    return callback(new Error("Erreur serveur creation des données pour le jeu"));
                });
        }
        // on renvoie le score
        return callback(null, score)
    }).catch(err => {
        console.log("Erreur récuperation score \n" + err)
        return callback(new Error("Erreur lors de la récupération du score."));
    });

}


module.exports = {
    putScoreTicTacToe,
    getScoreTicTacToe
}