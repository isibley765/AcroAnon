var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

/*
// Get all of the rows from the 1st spreadsheet.
doc.getRows(1, function (err, rows) {
    if (err) {
        console.log("Couldn't get the rows", err);
    }
});
*/

 class SheetInteract {
    constructor(sheetID) {
      // Create a document object using the ID of the spreadsheet - obtained from its URL.
      this.doc = new GoogleSpreadsheet(sheetID);

      // Authenticate with the Google Spreadsheets API.
      this.doc.useServiceAccountAuth(creds, function (err) {
          if (err) {
              console.error(err);
          } else {
              console.log("Connection to google sheet acquired");
          }
      });
    }

    insertRow (acronym, info, callback) {
        var error = false;
        this.doc.useServiceAccountAuth(creds, (err) => {
            if (err) {
                console.error(err);
                error = true;
            } else {
                this.doc.addRow(1, { name: acronym, description: info }, function(err) {
                    if(err) {
                        console.error("Writing to the Sheet failed", err);
                        error = true;
                    }

                    if (typeof callback == "function") {
                        callback(error);
                    }
                });
            }
        });
    }

    findAcronym (acronym, callback) {   //assumes callback exists for now
        var param = {exists: false, occur: []};
        if (acronym && typeof acronym == 'string') {
            this.doc.useServiceAccountAuth(creds, (err) => {
                if (err) {
                    callback(err);
                } else {
                    this.doc.getRows(1, {query: 'name == '+acronym}, (err, data) => {
                        if (err) {
                            callback(err);
                        } else {
                            data.forEach((val, i) => {
                                param.exists = true;
                                param.occur.push(val.description);
                            });
                            callback(null, param);
                        }
                    });
                }
            });
        } else {
            callback(null, param);
        }
    }
}
/*
sheetInteract.findAcronym("LIW", (err, acron) => {
    if (err) {
        console.error(err);
    } else {
        if(!acron.exists) {
            sheetInteract.insertRow("LIW", "Look, It's Working");
        } else {
            console.log(acron.occur);
        }
    }
});
*/

module.exports = SheetInteract
