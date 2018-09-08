const sqlite3 = require('sqlite3').verbose(); // makes long stack traces
const fs = require('fs');

class DB {
    constructor(sheet, file) {
        this.sheet = sheet;
        
        // To allow testing without interfering with the actual database
        // DO NOT CHANGE PLEASE
        file = (typeof file == 'string' && file == ":memory:") ? file : './slackapp.db';

        this.db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the \''+file+'\' SQlite database.');
            }

            this.initTables();
        });
    }

    initTables() {
        var int_a = "a".charCodeAt(0);
        var eng_query = "CREATE TABLE IF NOT EXISTS engdict(id INTEGER PRIMARY KEY AUTOINCREMENT";
        
        for(var i = 0; i < 26; i++) {   // Create columns for lowercase first letters a-z
            eng_query += ","+String.fromCharCode(int_a + i)+" varchar(255) UNIQUE";
        }
        eng_query += ");";

        this.db.run(eng_query, function(err) {
                if (err)
                    throw err;
                console.log("Created engdict table if it didn't exist already")
            }
        );

        this.db.run("CREATE TABLE IF NOT EXISTS acronyms(" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "acro varchar(255) NOT NULL," +
            "def varchar(255) UNIQUE NOT NULL," +
            "maker varchar(255) NOT NULL," +
            "date DATETIME DEFAULT CURRENT_TIMESTAMP);",
            function(err) {
                if (err)
                    throw err;
                console.log("Created acronym table if it didn't exist already")
            }
        );

          

        setTimeout(() => {     // Delay so former processes before filling operations execute, preventing collisions
            this.fillTables();
        }, 200);
    }

    dropTables() {
        this.db.run("DROP TABLE IF EXISTS engdict;",
            function(err) {
                if (err)
                    throw err;
                console.log("engdict has been dropped")
            }
        );
        
        this.db.run("DROP TABLE IF EXISTS acronyms;",
            function(err) {
                if (err)
                    throw err;
                console.log("acronyms has been dropped")
            }
        );

        
        setTimeout(() => {     // Delay so former processes before init operations execute, preventing collisions
            this.initTables();
        }, 200);
    }

    refreshAcronyms() {     // Compare against the google sheets acronyms, and update unknown, and check for deleted entries
        return false;
    }

    fillTables() {      // Fill the dictionary database from the file, and loads the google sheet into the acronym database
        this.sheet.getAllAcronyms((err, param) => {
            if(err) {
                console.error(err);
            } else if (param.populated) {
                param.occur.forEach((val) => {
                    this.dbInsert(val.name, val.description, val.maker);
                });
            }
            
        });

        fs.readFile("./src/database/dictionary_backup/en.txt", (err, data) => {
            var input = {};
            var longest = -1;
            var shortQuestions = [];
            data.toString().toLowerCase().split("\r\n").forEach((val) => {
                if (input[val[0]]) {       // 'fancy' way of making an array for each letter and sorting words by their first letter
                    input[val[0]].push(val);
                } else if (val[0]) {
                    input[val[0]] = [val];

                    shortQuestions.push("?");
                }
            });

            var alphabet = Object.keys(input).sort();
            var shortString = alphabet.join();
            shortQuestions = shortQuestions.join();
            var vals;

            alphabet.forEach((val) => {
                longest = longest > input[val].length ? longest : input[val].length;
            });

            for(var i = 0; i < longest; i++) {
                vals = [];
                alphabet.forEach((val) => {
                    vals.push( input[val][i] ? input[val][i] : "" );
                });
                
                this.db.all("INSERT OR IGNORE INTO engdict("+shortString+") VALUES("+shortQuestions+");", vals, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }

            console.log("Database initializations roughly done");
        })
    }

    fastSearch(acro, callback) {
        callback(false);       // This will be for the trie search
    }

    isWord(word, callback) {
        word = word.toLowerCase();

        this.db.all("SELECT "+word[0]+" FROM engdict WHERE "+word[0]+" = ?;", word, function(err, found) {
            if (callback) {
                callback(err, found.length != 0);
            }
        });
    }

    dbSearch(acro, callback) {
        this.db.all("SELECT * FROM acronyms WHERE acro = ?;", acro, function(err, acros) {
            if (callback) {
                callback(err, acros);
            }
        });
    }

    dbInsert(acro, def, user) {
        this.db.all("INSERT OR IGNORE INTO acronyms(acro, def, maker) VALUES(?, ?, ?);", [acro, def, user], function(err) {
            if (err) {
                console.error(err);
            }
        });
    }
}

module.exports = DB;