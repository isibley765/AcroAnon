var sqlite3 = require('sqlite3').verbose(); // makes long stack traces

class DB {
    constructor(sheet) {
        this.sheet = sheet;

        this.db = new sqlite3.Database('./slackapp.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the \'slackapp\' SQlite database.');
            }

            this.initTables();
        });
    }

    initTables() {
        var int_a = "a".charCodeAt(0);
        var eng_query = "CREATE TABLE IF NOT EXISTS eng_dict(id INTEGER PRIMARY KEY AUTOINCREMENT";
        
        for(var i = 0; i < 26; i++) {
            eng_query += ","+String.fromCharCode(int_a + i)+" varchar(255)";
        }
        eng_query += ");";

        this.db.run(eng_query, function(err) {
                if (err)
                    throw err;
                console.log("Created eng_dict table if it didn't exist already")
            }
        );

        this.db.run("CREATE TABLE IF NOT EXISTS acronyms(" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "acro varchar(255) NOT NULL," +
            "def varchar(255) NOT NULL," +
            "maker varchar(255) NOT NULL," +
            "date DATETIME DEFAULT CURRENT_TIMESTAMP);",
            function(err) {
                if (err)
                    throw err;
                console.log("Created acronym table if it didn't exist already")
            }
        );
    }

    dropTables() {
        this.db.run("DROP TABLE IF EXISTS eng_dict;",
            function(err) {
                if (err)
                    throw err;
                console.log("eng_dict has been dropped")
            }
        );
        
        this.db.run("DROP TABLE IF EXISTS acronyms;",
            function(err) {
                if (err)
                    throw err;
                console.log("acronyms has been dropped")
            }
        );
    }

    fastSearch(acro) {
        return false;       // This will be for the trie search
    }

    dbSearch(acro) {
        this.db.all("SELECT * FROM acronyms WHERE acro = ?;", acro, function(err, acros) {
            if (err) {
                console.error(err);
            } else {
                console.log(acros);

                return acros;
            }
        });
    }

    dbInsert(acro, def, user) {
        this.db.all("INSERT INTO acronyms(acro, def, maker) VALUES(?, ?, ?);", [acro, def, user], function(err) {
            if (err) {
                console.error(err);
            }
        });
    }
}

module.exports = DB;