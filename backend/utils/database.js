//const mysql = require('mysql');
const Sequelize = require('sequelize')
require('dotenv').config()

/* On crée une connexion à la base de données avec Sequelize : 
 On rentre le nom d'utilisateur et le mot de passe
 Puis le nom de la base de données
*/
const db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    logging: false
})

module.exports = db;