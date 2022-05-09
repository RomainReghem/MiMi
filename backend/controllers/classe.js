const Classe = require('../models/users').Classe
const Eleve = require('../models/users').Eleve

const getAllStudents = (req, res) =>{
const mail = req.query.mail
    console.log("yo")
    Eleve.findAll({
        attributes:['courriel'],
       
        // jointure avec la table eleve
        include: [{
            model :Classe,
            attributes:[],
           required: true,
            where :{
                courriel:mail
            }
        }]
    }).then(eleves =>{
        for(e in eleves){
            console.log('élève '+e)
        }
       // res.json({students:eleves})
       res.json({eleves:eleves})
    })
}


module.exports = {
    getAllStudents
}
