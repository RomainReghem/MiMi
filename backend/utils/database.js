//const mysql = require('mysql');
const Sequelize = require('sequelize')

const db = new Sequelize('db_mimi', 'projetmimi', 'mdpmimi!', {
    dialect: 'mysql',
    host: '35.187.74.158',
    logging: false
} )

/* On crée une connexion à la database : pour l'instant elle est stockée sur un cloud google
 On rentre le nom d'utilisateur et le mot de passe
 Puis le nom de la base de données
*/
/*const db = mysql.createConnection({
    host: '35.187.74.158',
    user: 'projetmimi',
    password: 'mdpmimi!',
    database: 'db_mimi'
});*/


module.exports= db;