const Eleve = require('../models/users').Eleve

const getUsernameStudent = (req, res) =>{
    const mail = req.body.mail

    Eleve.findAll({
        attributes:pseudo,
        where :{
            courriel:mail
        }
    }).then(pseudo =>{
        console.log('pseudo '+pseudo)
        //res.json({username: pseudo})
        res.json(pseudo)
    })
}


module.exports = {
    getUsernameStudent
}
