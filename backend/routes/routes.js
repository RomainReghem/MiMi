// MIDDLEWARES
const verifyJWT = require('../middleware/verificationJWT.js').verifyJWT
const verifyDoc = require('../middleware/verificationSauvegardeDoc.js')
const verifyImg = require('../middleware/verificationImage.js')
// CONTROLLERS
const Connexion = require('../controllers/connexion.js')
const Inscription = require('../controllers/inscription.js')
const Deconnexion = require('../controllers/deconnexion.js')
const refreshToken = require('../controllers/refreshToken.js')
const Image = require('../controllers/image.js')
// pour les documents
const SuppressionDoc = require('../controllers/suppressionDocument.js')
const AjoutDoc = require('../controllers/ajoutDocument.js')
const Document = require('../controllers/recuperationDocument.js')
const ChangeDoc = require('../controllers/changementDocument.js')
// controlleurs spécifiques en fonction du type d'utilisateur
const Eleve = require('../controllers/eleve.js')
const ModificationEleve = require('../controllers/modificationEleve.js')
const Classe = require('../controllers/classe.js')
const ModificationClasse = require('../controllers/modificationClasse.js')
// controlleur pour le score
const Score = require('../controllers/score.js')

// LIBRAIRIES
const express = require('express')
const { verifyAccesGet, verifyAccessSave } = require('../middleware/verifyMail.js')
const router = express.Router();

// route de la connexion d'un utilisateur
router.post('/login', Connexion.Connexion);
// route de l'inscription d'un eleve
router.post('/registerStudent', Inscription.InscriptionEleve);
// route de l'inscription d'une classe
router.post('/registerClass', Inscription.InscriptionClasse);
// route pour déconnecter un utilisateur
router.get('/logout', Deconnexion)
// Pour réactualiser les tokens
router.get('/refresh', refreshToken.refreshToken);

// pour toutes les routes qui ont besoin d'une authentification : on fait appel au middleware qui vérifie la validité du token
//router.use(verifyJWT)

// route qui permet de retourner un pseudo à partir du mail
router.get('/pseudo', verifyJWT, Eleve.getUsernameStudent)
// route qui permet de refuser l'invitation de la classe (et donc supprime la classe et l'invitation de la bd)
router.post('/refuseInvite', verifyJWT, ModificationEleve.SuppressionClasse)
// route qui permet de supprimer la classe d'un eleve (cad on retire l'invitation)
router.post('/quitClass', verifyJWT, ModificationEleve.SuppressionClasse)

// route pour changer le pseudo : seulement pour l'élève
router.post('/changePseudo', verifyJWT, ModificationEleve.ChangementPseudo)
// route qui permet d'accepter l'invitation d'une classe
router.post('/acceptInvite', verifyJWT, ModificationEleve.AcceptationInvitation)

// route qui permet de retourner la liste d'emails des eleves d'une classe
router.get('/eleves', verifyJWT, Classe.getAllStudents)
// route qui permet d'envoyer une invitation à un élève
router.post('/inviteEleve', verifyJWT, ModificationClasse.ajoutInvitation)
// route permettant de supprimer un élève de la classe
router.post('/deleteEleve', verifyJWT, ModificationClasse.suppressionEleve)

// route pour sauvegarder l'avatar d'un élève
router.post('/avatar', verifyJWT, Image.saveAvatar)
// route pour récupèrer l'avatar
//router.get('/avatar', verifyJWT, Image.getAvatar)
// route pour sauvegarder l'image de profil d'un élève
router.post('/saveImage', verifyJWT, verifyImg.single("file"), Image.savePicture)
// route pour récupèrer l'image de profil d'un élève
//router.get('/getImage', verifyJWT, Image.getPicture)

// route pour sauvegarder un document d'un élève
router.post('/saveFile', verifyJWT, verifyDoc.single("file"), AjoutDoc.saveCoursEleve)
// route pour sauvegarder un document d'une classe
router.post('/saveFileClass', verifyJWT, verifyDoc.single("file"), AjoutDoc.saveCoursClasse)
// route pour récupèrer un document d'un élève
router.get('/getFile', verifyJWT, Document.getCoursEleve)
// route pour récupèrer le nom de tous les cours qu'un élève possède dans une matière donnée
router.get('/getCours', verifyJWT, Document.getAllCoursEleve)
// route pour accèder à un fichier précis de la classe, dans une matière donnée
router.get('/getFileClass', verifyJWT, Document.getCoursClasse)
// route pour récupérer le nom de tous les fichiers présents pour une matière
router.get('/getCoursClass', verifyJWT, Document.getAllCoursClasse)

// Supprimer les cours
// route pour supprimer un cours à l'élève
router.delete('/coursEleve', verifyJWT, SuppressionDoc.deleteCoursEleve)
// route pour supprimer un cours à la classe
router.delete('/coursClasse', verifyJWT, SuppressionDoc.deleteCoursClasse)

// Renommer les cours
// route pour renommer le nom d'un cours(fichier) d'une classe
router.post("/editFileClasse", verifyJWT, ChangeDoc.renameCoursClasse)
// route pour renommer le nom d'un cours(fichier) d'un élève
router.post("/editFileEleve", verifyJWT, ChangeDoc.renameCoursEleve)

// PAS IMPLEMENTE : SUPPRESSION
// route pour supprimer l'élève
// router.delete("/eleve", Eleve.deleteStudent)
// PAS IMPLEMENTE
// route pour supprimer la classe
// router.delete("/classe", Classe.deleteClass)

// route pour changer le mot de passe de la classe
router.post('/changePwdClasse', verifyJWT, ModificationClasse.changementMdpClasse)
// route pour changer l'adresse mail de la classe
router.post('/changeMailClasse', verifyJWT, ModificationClasse.changementMailClasse)
// route pour changer le mot de passe de l'élève
router.post('/changePwdEleve', verifyJWT, ModificationEleve.ChangementMdp)
// route pour changer l'adresse mail de l'élève
router.post('/changeMailEleve', verifyJWT, ModificationEleve.ChangementMail)

// score de jeu
// route pour récupérer un score de jeu (appel à chaque fin de partie)
router.get('/score', verifyJWT, Score.getScoreTicTacToe)

// Modification des fichiers
// route pour récupèrer le nom des fichiers d'un utilisateur, en fonction de son adresse mail
router.get('/files', verifyJWT, verifyAccesGet, Document.getFiles)
// route pour récupèrer un fichier particulier
router.get('/file', verifyJWT, verifyAccesGet, Document.getFile)
// route pour déposer un fichier
router.post('/file', verifyJWT, verifyDoc.single("file"), verifyAccessSave, AjoutDoc.saveFile)
// route pour supprimer un fichier
router.delete('/file', verifyJWT, verifyAccessSave, SuppressionDoc.deleteFile)
// route pour renommer un fichier
router.put('/file', verifyJWT, verifyAccessSave, ChangeDoc.renameFile)

// PAS IMPLEMENTE : MATIERES 
/*PAS IMPLEMENTE : CHANGEMENT DE NOM DES FICHIERS
// route pour renommer la matière d'une classe
router.put("matiereClass", ChangeDoc.renameMatiereClasse)
// route pour renommer la matière d'une classe
router.put("coursClass", ChangeDoc.renameMatiereClasse)*/
// PAS IMPLEMENTE : ajout de matiere
// route pour ajouter une matiere à l'élève
// router.post('matiereEleve', AjoutDoc.addMatiereEleve)
// route pour ajouter une matiere à la classe
// router.post('matiereClasse', AjoutDoc.addMatiereClasse)
// PAS IMPLEMENTE : suppression de matiere/cours
// route pour supprimer une matiere à l'élève
//router.delete('matiereEleve', SuppressionDoc.deleteMatiereEleve)
// PAS IMPLEMENTE
// route pour supprimer une matiere à la classe
//router.delete('matiereClasse', SuppressionDoc.deleteMatiereClasse)
/*// route pour récupèrer le nom de toutes les matières qu'une classe a
router.get('/getMatiereClass', verifyJWT, Document.getAllMatieresClasse)
// route pour récupèrer le nom de toutes les matières qu'un élève possède
router.get('/getMatieres', verifyJWT, Document.getAllMatieresEleve)*/

module.exports = router;