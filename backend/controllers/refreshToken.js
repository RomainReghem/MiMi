const db = require('../utils/database');
const connexion = require('./connexion')
const refreshTokens=connexion.refreshTokens;
const jwt =require('jsonwebtoken');

require('dotenv').config()

const refreshToken = (req, res)=>{
   const cookies = req.cookies;
    if(!cookies?.jwt){
        console.log("acès refusé")
        // 401
        return res.sendStatus(201)
    }
    const refreshToken = cookies.jwt;
    if(!refreshTokens.includes(refreshToken)){
        //token invalide 
        return res.sendStatus(400)
    }
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err){
                refreshTokens=refreshTokens.filter((c)=> c!= refreshToken)
                console.log(err)
                // interdit
                res.sendStatus(403)
            }
            const accessToken=jwt.sign({'mail':decoded.mail}, process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'5m'});
            res.json({accessToken});
        }
    )


}

module.exports = {refreshToken};
