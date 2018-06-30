var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

var id = "1pt0mhsbGDEKRjUSHQ8xTRHoaeC71YNy1xjhl4wLr8ho";
 
// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet(id);
 
// Authenticate with the Google Spreadsheets API.
doc.useServiceAccountAuth(creds, function (err) {
    if (err) {
        console.log
    } else {
        console.log("Connection to google sheet aquired");
    }
});

/*
// Get all of the rows from the 1st spreadsheet.
doc.getRows(1, function (err, rows) {
    if (err) {
        console.log("Couldn't get the rows", err);
    }
});
*/

 var sheetInteract = {
    insertRow: (acronym, info) => {
        doc.useServiceAccountAuth(creds, (err) => {
            if (err) {
                console.log
            } else {
                doc.addRow(1, { name: acronym, description: info }, function(err) {
                    if(err) {
                        console.log("Writing to the Sheet failed", err);
                    }
                });
            }
        });
    },
    findAcronym: (acronym, callback) => {   //assumes callback exists for now
        var param = {exists: false, occur: {}};
        doc.useServiceAccountAuth(creds, (err) => {
            if (err) {
                callback(err);
            } else {
                doc.getRows(1, {query: 'name == '+acronym}, (err, data) => {
                    if (err) {
                        callback(err);
                    } else {
                        data.forEach((val, i) => {
                            param.exists = true;
                            param.occur[val.name] = val.description;
                        })
                        callback(null, param);
                    }
                });
            }
        });
    }
}

sheetInteract.findAcronym("LIW", (err, acron) => {
    if (err) {
        console.log(err);
    } else {
        if(!acron.exists) {
            sheetInteract.insertRow("LIW", "Look, It's Working");
        } else {
            console.log(acron.occur);
        }
    }
});