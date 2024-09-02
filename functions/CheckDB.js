const sqlite3 = require('sqlite3').verbose();
const config = require('../configs/config.json');
const db = new sqlite3.Database(config.database_file, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });
return db;