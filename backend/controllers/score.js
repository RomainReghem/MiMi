const Score= require('../models/users').Score


const ajoutScore = (req, res)=>{
    const email = req.body.mail;
    const score=req.body.score;
    const jeu=req.body.game;

    // verif mail ici

    Score.create({
        
    })
    
}