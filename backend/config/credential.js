
const credential = (req, res, next) => {
    // on récupère la source de la requête
    const origin = req.headers.origin
    // la liste des sources autorisées (pour l'instant comme on est sur du local, que du localhost)
    const allowedOrigins = [
        'http://localhost:3500',
        'http://localhost:3000',
        '35.187.74.158']

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = credential
