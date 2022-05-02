const verifyJWT = require('../middleware/verificationJWT')
const Connexion = require('../controllers/connexion.js')
const Inscription = require('../controllers/inscription.js')
const refreshToken = require('../controllers/refreshToken.js')

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
//router.get('/refresh', refreshToken.refreshToken);


module.exports = router;