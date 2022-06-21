// MIDDLEWARES
const verifyJWT = require('../middleware/verificationJWT.js').verifyJWT
const verifyDoc = require('../middleware/verificationDoc.js')
const verifyImg = require('../middleware/verificationImage.js')
const verifyTokenMail = require('../middleware/verificationTokenMail.js').verifyTokenMail
const { verifyMailBody, verifyMailQuery } = require('../middleware/verificationMail.js')
const { verifyAccesGet, verifyAccessSave } = require('../middleware/verificationAccesDoc.js')
// CONTROLLERS
const Connexion = require('../controllers/connexion.js')
const Inscription = require('../controllers/inscription.js')
const Deconnexion = require('../controllers/deconnexion.js')
const refreshToken = require('../controllers/refreshToken.js')
const Image = require('../controllers/image.js')
const OubliMdp=require('../controllers/reinitialisationMotDePasse.js')
// pour les documents
const SuppressionDoc = require('../controllers/suppressionDocument.js')
const AjoutDoc = require('../controllers/ajoutDocument.js')
const RecupDoc = require('../controllers/recuperationDocument.js')
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
const router = express.Router();

// Inscription & connexion
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

// Gestion par l'élève des invitations à rejoindre une classse
// route qui permet de refuser l'invitation de la classe (et donc supprime la classe et l'invitation de la bd)
router.post('/refuseInvite', verifyJWT, ModificationEleve.SuppressionClasse)
// route qui permet de supprimer la classe d'un eleve (cad on retire l'invitation)
router.post('/quitClass', verifyJWT, ModificationEleve.SuppressionClasse)
// route qui permet d'accepter l'invitation d'une classe
router.post('/acceptInvite', verifyJWT, ModificationEleve.AcceptationInvitation)

// Gestion du pseudo de l'élève
// route pour changer le pseudo : seulement pour l'élève
router.post('/changePseudo', verifyJWT, verifyMailBody, ModificationEleve.ChangementPseudo)
// route qui permet de retourner un pseudo à partir du mail
router.get('/pseudo', verifyJWT, verifyMailQuery, Eleve.getUsernameStudent)

// Gestion des élèves invités par la classe
// route qui permet de retourner la liste d'emails, ainsi que le noms des eleves d'une classe
router.get('/eleves', verifyJWT, verifyMailQuery, Classe.getAllStudents)
// route qui permet d'envoyer une invitation à un élève
router.post('/inviteEleve', verifyJWT, ModificationClasse.ajoutInvitation)
// route permettant de supprimer un élève de la classe
router.post('/deleteEleve', verifyJWT, ModificationClasse.suppressionEleve)

// Sauvegarde de la photo de profil et de l'avatar
// route pour sauvegarder l'avatar d'un élève
router.post('/avatar', verifyJWT, verifyMailBody, Image.saveAvatar)
// route pour sauvegarder l'avatar d'un élève au format image
router.post('/avatarAsImage', verifyJWT, verifyImg.uploadAvatar.single("file"), verifyMailBody, Image.saveAvatarAsImage)
// route pour sauvegarder l'image de profil d'un élève
router.post('/saveImage', verifyJWT, verifyImg.upload.single("file"), verifyMailBody, Image.savePicture)

// PAS IMPLEMENTE : SUPPRESSION de compte
// route pour supprimer l'élève
// router.delete("/eleve", verifyJWT, verifyMailBody, Eleve.deleteStudent)
// PAS IMPLEMENTE
// route pour supprimer la classe
// router.delete("/classe", verifyJWT, verifyMailBody, Classe.deleteClasse)

// Changement de mot de passe et de mail
// route pour changer le mot de passe de la classe
router.post('/changePwdClasse', verifyJWT, verifyMailBody, ModificationClasse.changementMdpClasse)
// route pour changer l'adresse mail de la classe
router.post('/changeMailClasse', verifyJWT, verifyMailBody, ModificationClasse.changementMailClasse)
// route pour changer le mot de passe de l'élève
router.post('/changePwdEleve', verifyJWT, verifyMailBody, ModificationEleve.ChangementMdp)
// route pour changer l'adresse mail de l'élève
router.post('/changeMailEleve', verifyJWT, verifyMailBody, ModificationEleve.ChangementMail)

// Score de jeu
// route pour récupérer un score de jeu (appel à chaque fin de partie)
router.get('/score', verifyJWT, verifyMailQuery, Score.getScoreTicTacToe)
// PAS IMPLEMENTE : remise à zéro du score
// route pour remettre à zéro le score (le réinitialiser) d'une classe et de ses eleves
// router.delete('/score', verifyJWT, Score.resetScore)

// Modification des fichiers
// route pour récupèrer le nom des fichiers d'un utilisateur, en fonction de son adresse mail
router.get('/files', verifyJWT, verifyAccesGet, RecupDoc.getFiles)
// route pour récupèrer un fichier particulier
router.get('/file', verifyJWT, verifyAccesGet, RecupDoc.getFile)
// route pour déposer un fichier
router.post('/file', verifyJWT, verifyDoc.single("file"), verifyAccessSave, AjoutDoc.saveFile)
// route pour supprimer un fichier
router.delete('/file', verifyJWT, verifyAccessSave, SuppressionDoc.deleteFile)
// route pour renommer un fichier
router.put('/file', verifyJWT, verifyAccessSave, ChangeDoc.renameFile)

// Mot de passe oublié
// route pour envoyer un mail avec un token pour l'oubli de mdp
router.post("/sendMail", OubliMdp.sendResetPassword)
// router pour reinitialiser un mot de passe à partir du token d'un eleve
router.post("/resetPwd", verifyTokenMail, OubliMdp.resetPassword)


module.exports = router;