const Eleve = require('../models/users').Eleve

const getUsernameStudent = (req, res) => {
    const mail = req.query.mail
 
    if (mail==undefined){
        console.log("pas de mail")
        res.status(409).send("Pas de mail")
    } else {
        Eleve.findOne({
            where: {
                courriel: mail
            }
        }).then(eleve => {
            if(eleve){
                console.log('pseudo ' + eleve.pseudo)
                res.json({pseudo: eleve.pseudo})
                //res.send(eleve.pseudo)
            }else{
                res.status(409).send("Aucun élève avec cette adresse")
            }
        })
    }
}


module.exports = {
    getUsernameStudent
}
