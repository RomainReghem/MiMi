const db = require('../utils/database');
const connexion = require('./connexion')
let refreshTokens = connexion.refreshTokens;
const jwt = require('jsonwebtoken');

require('dotenv').config()

const refreshToken = (req, res) => {
    const cookies = req.cookies;
    console.log("refresh cookies" + cookies);
    if (!cookies?.jwt) {
        console.log("accès refusé")
        // 401 : authentification raté
        return res.sendStatus(201)
    }
    const refreshToken = cookies.jwt;
    if (!refreshTokens.includes(refreshToken)) {
        //token invalide 
        return res.sendStatus(400)
    }
    console.log('REFRESH ' + refreshToken)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded == undefined) {
                console.log("to")
                //refreshTokens = refreshTokens.filter((c) => c != refreshToken)
                console.log(err);
                // accès interdit
                res.sendStatus(403);
            }else{
                console.log("decoded " + decoded.mail+" : "+ decoded.role)
                const accessToken = jwt.sign(
                    { 'mail': decoded.mail, 'role':decoded.role },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '10m' });
                res.json({ accessToken });
            }
        }
    )


}

module.exports = { refreshToken };
