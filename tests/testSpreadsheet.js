const SheetClass = require("../src/googleSpreadsheet.js");
require("dotenv").config({path: __dirname + '/tokens.env'});

class SheetTester {     //Bus has no internet, will write later
    constructor() {
        this.sheet = SheetClass(process.env.GOOGLE_SHEET);
    }

    postAcronym() {

    }
}
