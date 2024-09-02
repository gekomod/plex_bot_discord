const sqlite3 = require('sqlite3').verbose();
const config = require('../configs/config.json');

	const db = new sqlite3.Database(config.database_file, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });
 
// Create Database
function CreateDatabase() {
	
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY, title TEXT, photo TEXT, duration INTEGER)", (err) => {
            if (err) {
                console.error("Error creating database table:", err.message);
            }
        });
    });
}

module.exports = CreateDatabase;