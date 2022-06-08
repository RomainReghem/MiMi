//const mysql = require('mysql');
const Sequelize = require('sequelize')
require('dotenv').config()


const db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    logging: false
})

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


module.exports = db;