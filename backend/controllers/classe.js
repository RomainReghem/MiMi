const Class = require('../models/users').Classe
const Eleve = require('../models/users').Eleve

const getAllStudents = (req, res) =>{
    const mail = req.body.mail
    console.log("yo")
    Class.findAll({
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
            console.log('élève '+e.courriel)
        }
       // res.json({students:eleves})
       res.json({mail:eleves.courriel})
    })
}


module.exports = {
    getAllStudents
}
