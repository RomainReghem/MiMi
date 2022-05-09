const verifyJWT = require('../middleware/verificationJWT.js').verifyJWT
const Connexion = require('../controllers/connexion.js')
const Inscription = require('../controllers/inscription.js')
const refreshToken = require('../controllers/refreshToken.js')
const Modification = require('../controllers/modification.js')
const Document = require('../controllers/document.js')

// controlleurs spécifiques en fonction du type d'utilisateur
const Eleve = require('../controllers/eleve.js')
const Classe = require('../controllers/classe.js')

const express = require('express')
const router = express.Router();

// route de la connexion d'un utilisateur
//router.post('/login', verifyJWT, Connexion.Connexion);
router.post('/login', Connexion.Connexion);
// route de l'inscription d'un eleve
router.post('/registerStudent', Inscription.InscriptionEleve);
// route de l'inscription d'une classe
router.post('/registerClass', Inscription.InscriptionClasse);
// route pour déconnecter un utilisateur
router.get('/logout', Connexion.Deconnexion)
// Pour réactualiser les tokens
router.get('/refresh', refreshToken.refreshToken);
// Pour changer le mot de passe 
router.post('/changePwd', Modification.ChangementMdp)
// route pour changer le mail
router.post('/changeMail', Modification.ChangementMail)
//router.post('/changeMail', verifyJWT, Modification.ChangementMail)

// route qui permet de retourner un pseudo à partir du mail
router.post('/pseudo', Eleve.getUsernameStudent)
// route qui permet de retourner la liste d'emails des eleves d'une classe
router.get('/eleves', Classe.getAllStudents)

// route pour sauvegarder l'avatar d'un élève
//router.post('/avatar', Document.saveAvatar)
// router pour récupèrer l'avatar
//router.get('/avatar', Document.getAvatar)

// route pour changer le pseudo, seulement pour l'élève
// router.post('/change', Modification.ChangementPseudo)
// route pour changer les préférences (comment l'élève sera représenté)
// router.post('/change', Modification.ChangementPreference)

module.exports = router;