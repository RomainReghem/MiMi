const Connexion = require('../controllers/connexion.js')
const Inscription = require('../controllers/inscription.js')

const express = require('express')
const router = express.Router();

router.post('/login', Connexion.Connexion);
router.post('/registerStudent', Inscription.InscriptionEleve);
router.post('/registerClass', Inscription.InscriptionClasse);

router.use('/', (req, res, next) => {
    res.sendStatus(500);
});


module.exports = router;