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