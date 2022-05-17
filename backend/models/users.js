const Sequelize = require('sequelize')
const db = require('../utils/database')

const Eleve = db.define('eleve', {
    ideleve: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    pseudo :{
        type:Sequelize.STRING,
        allowNull:false
    },
    courriel: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    prenom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    invitation: {
        type: Sequelize.ENUM('acceptee', 'en attente', 'aucune'),
        defaultValue: "aucune"
    },
    motdepasse: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    idclasse: {
        type: Sequelize.INTEGER,
        references: 'classe', 
        referencesKey:'idclasse'
    }
}, {timestamps: false, freezeTableName: true, tableName:'eleve'});

const Classe = db.define('classe', {
    idclasse: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    courriel: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    motdepasse: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {timestamps: false, freezeTableName: true, tableName:'classe'});

const Score = db.define('score',
{
    idscore : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    }
}, {timestamps: false, freezeTableName: true, tableName:'score'})

//relations
// un eleve a une classe, une classe a un ou plusieurs élèves
Classe.hasMany(Eleve,{foreignKey: 'idclasse'})
Eleve.belongsTo(Classe,{foreignKey:'idclasse'})
// Eleve.hasOne(Score,{as:'score'})
//Score.belongsTo(Eleve, {as:"eleves"})

module.exports= {Eleve, Classe};