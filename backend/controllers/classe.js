const { Classe } = require('../models/users')

const Class = require('../models/users').Classe
const Eleve = require('../models/users').Eleve

const getAllStudents = (req, res) =>{
    const mail = req.query.mail
    console.log("yo")
    Class.findAll({
        attributes:classe.courriel,
        where :{
            courriel:mail
        },
        // jointure avec la table eleve
        include: [{
            model :Eleve,
            required: true
        }]
    }).then(eleves =>{
        for(e in eleves){
            console.log('élève '+e)
        }
       // res.json({students:eleves})
       res.json({mail:eleves})
    })
}


module.exports = {
    getAllStudents
}
