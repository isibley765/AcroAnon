const SheetClass = require("../src/googleSpreadsheet.js");
const Database = require("../src/database/database_trie.js");
const printcolor = require("./consoleMessageColoring.js");
require("dotenv").config({path: __dirname + '/tokens.env'});


/*
    This is a fake spreadsheet interacter, it checks all reactions of the provided callback if required
    Good for testing without internet
*/
class FakeSheetInteract {
    constructor() {
        console.log("Fake google sheets interface created;\n"+
        "This calls callbacks with all versions of possible responses, and mock results");

        // Safe, cause DB is/will be generated from sheet upon process start
        // As long as there's one sheet object per database object, will be fine
        this.lastUpdate = new Date();
    }

    insertRow (acronym, info, user, callback) {
        console.log("Pseudo insert for "+acronym+", "+info+", and "+user+", success and fail.");

        this.lastUpdate = new Date();

        callback(false);
        callback(true);
    }

    findAcronym (acronym, callback) {   //assumes callback exists for now
        console.log("Test for getting acronym, returning 'LIW' acronym test results regardless of input");

        
        var param = {populated: true, occur: [
            {name: "LIW", description: "Look It Works", maker: "tester"},
            {name: "LIW", description: "Lowker In Wisconson", maker: "tester"},
            {name: "LIW", description: "Losing It Weirdly", maker: "John Cambel"},
        ]};

        callback(null, param);  // Should operate normally
        callback("Testing the error", param); // Should print the error only
        callback(null, {populated: false, occur: param.occur});   // Should ignore the filled occurrances
    }

    getAllAcronyms(callback) {   //assumes callback exists for now
        console.log("Test for getting all acronyms");

        
        var param = {populated: true, occur: [
            {name: "LIW", description: "Look It Works", maker: "tester"},
            {name: "LIW", description: "Lowker In Wisconson", maker: "tester"},
            {name: "LIW", description: "Losing It Weirdly", maker: "John Cambel"},
            {name: "TIAT", description: "This Is A Test", maker: "Noodle #7"},
            {name: "TBIC", description: "This Bus Is Cramped", maker: "Poor College Student"},
        ]};

        callback(null, param);  // Should operate normally
        callback("Testing the error", param); // Should print the error only
        callback(null, {populated: false, occur: param.occur});   // Should ignore the filled occurrances
    }
}

/*
    The breadwinner
    This is what's actually going to be testing the database
    Trie tests might go in another test class just to keep these test classes shorter
*/

class TestDB {
    constructor(testType) {
        if (testType == true || (typeof testType == 'string' && testType.toLowerCase() == "real")) {
            this.sheet = new SheetClass(process.env.GOOGLE_SHEET);
        } else {
            this.sheet = new FakeSheetInteract();
        }
        
        // Second variable to allow testing without interfering with the actual database
        // DO NOT CHANGE OR REMOVE PLEASE
        this.db = new Database(this.sheet, ":memory:");

        this.testInsertSearch = this.testInsertSearch.bind(this);
        this.testDrop = this.testDrop.bind(this);
    }

    testInsertSearch() { 

        this.db.dbInsert("AAAA", "Alex Awantsthis Ato Apleasestop", "tester");
        this.db.dbSearch("AAAA", (err, acros) => {
            if (err) {
                console.error(err);
            } else {
                acros = acros[0];
                var comp = {
                    id: acros.id,
                    acro: 'AAAA',
                    def: 'Alex Awantsthis Ato Apleasestop',
                    maker: 'tester',
                    date: acros.date
                }

                var defset = new Set(Object.keys(comp));
                var inset = Object.keys(acros);
                var same = false;
                var match = true;

                if (defset.size == inset.length) {
                    inset.forEach((val) => {
                        defset.delete(val);
                        match *= (comp[val] == acros[val]);
                    });
                    
                    same = defset.size == 0;
                }
                
                if (match && same) {
                    printcolor("Insert test passed", "green");
                } else {
                    printcolor("Insert test failed", "red");
                }
            }
        });
    }

    testDrop() {

        this.db.dbInsert("AAAA", "Alex Awantsthis Ato Apleasestop", "tester");

        setTimeout(() => {
            this.db.dropTables();
        }, 100);

        setTimeout(() => {
            this.db.dbSearch("AAAA", (err, acros) => {
                if (err) {
                    console.error(err);
                } else {
                    if (acros.length == 0) {
                        printcolor("Insert test passed", "green");
                    } else {
                        printcolor("Insert test failed", "red");
                    }
                }
            });
        }, 500);
    }

    testWord(word) {
        this.db.isWord(word, (err, data) => {
            if(err)
                throw err

            console.log(data);
        });
    }
}

module.exports = TestDB;

var tdb = new TestDB(false);

setTimeout(() => {
        tdb.testWord("Dragon");
}, 1000);