const Sequelize = require('sequelize')
const db = require('../utils/database')

const Eleve = db.define('eleve', {
    ideleve: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    pseudo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    courriel: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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
        referencesKey: 'idclasse'
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, { timestamps: false, freezeTableName: true, tableName: 'eleve' });

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
        unique: true
    },
    motdepasse: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, { timestamps: false, freezeTableName: true, tableName: 'classe' });

const Score = db.define('score',
    {
        idscore: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        jeu: {
            type: Sequelize.STRING,
            allowNull: false
        },
        scoreclasse: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        scoreeleves: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        nbpartie: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        idclasse: {
            type: Sequelize.INTEGER,
            references: 'classe',
            referencesKey: 'idclasse',
            allowNull: false
        }
    }, { timestamps: false, freezeTableName: true, tableName: 'score' })

//relations
// un eleve a une classe, une classe a un ou plusieurs élèves
Classe.hasMany(Eleve, { foreignKey: 'idclasse' })
Eleve.belongsTo(Classe, { foreignKey: 'idclasse' })
// une classe a un score pour chaque jeu auquel il a joué
Classe.hasMany(Score, { foreignKey: 'idclasse' })
Score.belongsTo(Classe,{foreignKey:'idclasse'})

module.exports = { Eleve, Classe, Score };