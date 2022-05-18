// MIDDLEWARES
const verifyJWT = require('../middleware/verificationJWT.js').verifyJWT
const verifyDoc = require('../middleware/verificationSauvegardeDoc.js')
const verifyImg = require('../middleware/verificationImage.js')
// CONTROLLERS
const Connexion = require('../controllers/connexion.js')
const Inscription = require('../controllers/inscription.js')
const Deconnexion = require('../controllers/deconnexion.js')
const refreshToken = require('../controllers/refreshToken.js')
const Modification = require('../controllers/modification.js')
const Image = require('../controllers/image.js')
// pour les documents
const SuppressionDoc = require('../controllers/suppressionDocument.js')
const AjoutDoc = require('../controllers/ajoutDocument.js')
const Document = require('../controllers/recuperationDocument.js')

// controlleurs spécifiques en fonction du type d'utilisateur
const Eleve = require('../controllers/eleve.js')
const ModificationEleve = require('../controllers/modificationEleve.js')
const Classe = require('../controllers/classe.js')
const ModificationClasse = require('../controllers/modificationClasse.js')

// LIBRAIRIES
const express = require('express')
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

// Pour changer le mot de passe 
router.post('/changePwd', Modification.ChangementMdp)
// route pour changer le mail
router.post('/changeMail', Modification.ChangementMail)
//router.post('/changeMail', verifyJWT, Modification.ChangementMail)

// route qui permet de retourner un pseudo à partir du mail
router.get('/pseudo', Eleve.getUsernameStudent)
// PAS IMPLEMENTE
// route qui permet de retourner le statut de l'invitation et la classe liée à partir du mail de l'élève
//router.get('/invitation', Eleve.getInvitation)
// route qui permet de refuser l'invitation de la classe
router.post('/refuseInvite', ModificationEleve.SuppressionClasse)
// route qui permet de supprimer la classe d'un eleve
router.post('/quitClass', ModificationEleve.SuppressionClasse)

// route pour changer le pseudo : seulement pour l'élève
router.post('/changePseudo', ModificationEleve.ChangementPseudo)
// PAS IMPLEMENTE
// route qui permet d'accepter l'invitation d'un eleve par une classe
router.post('/acceptInvite', ModificationEleve.AcceptationInvitation)

// route qui permet de retourner la liste d'emails des eleves d'une classe
router.get('/eleves', Classe.getAllStudents)
// route qui permet d'envoyer une invitation à un élève
router.post('/inviteEleve', ModificationClasse.ajoutInvitation)
// route permettant de supprimer un élève de la classe
router.post('/deleteEleve', ModificationClasse.suppressionEleve)

// route pour sauvegarder l'avatar d'un élève
router.post('/avatar', Image.saveAvatar)
// route pour récupèrer l'avatar
router.get('/avatar', Image.getAvatar)
// route pour sauvegarder l'image de profil d'un élève
router.post('/saveImage', verifyImg.single("file"), Image.savePicture)
// route pour récupèrer l'image de profil d'un élève
router.get('/getImage', Image.getPicture)

// route pour sauvegarder un document d'un élève
router.post('/saveFile', verifyDoc.single("file"), AjoutDoc.saveCoursEleve)
// route pour sauvegarder un document d'une classe
router.post('/saveFileClass', verifyDoc.single("file"), AjoutDoc.saveCoursClasse)
// route pour récupèrer un document d'un élève
router.get('/getFile', Document.getCoursEleve)
// route pour récupèrer le nom de tous les cours qu'un élève possède dans une matière donnée
router.get('/getCours', Document.getAllCoursEleve)
// route pour récupèrer le nom de toutes les matières qu'un élève possède
router.get('/getMatieres', Document.getAllMatieresEleve)
/*
getFileClass
getCoursClass
getMatieresClass*/
// PAS IMPLEMENTE
// route pour ajouter une matiere à l'élève
// router.post('matiereEleve', AjoutDoc.addMatiereEleve)
// PAS IMPLEMENTE
// route pour supprimer une matiere à l'élève
//router.delete('matiereEleve', SuppressionDoc.deleteMatiereEleve)
// PAS IMPLEMENTE
// route pour supprimer une matiere à la classe
//router.delete('matiereClasse', SuppressionDoc.deleteMatiereClasse)
// PAS IMPLEMENTE
// route pour supprimer un cours à l'élève
//router.delete('coursEleve', SuppressionDoc.deleteCoursEleve)
// PAS IMPLEMENTE
// route pour supprimer un cours à la classe
//router.delete('coursClasse', SuppressionDoc.deleteCoursClasse)

// PAS IMPLEMENTE
// route pour supprimer l'élève
// router.delete("/eleve", Eleve.deleteStudent)

module.exports = router;