const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'projetmimi',
    password: 'mdpmimi!',
    database: 'db_mimi'
});

module.exports= db;