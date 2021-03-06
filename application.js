// First we need to install our server library (express), and tell the app how to interpret incoming data (body-parser)
require("dotenv").config({path: __dirname + '/tokens.env'});

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");

if (process.argv[2] != "normal") {
    console.log("Logging to files");
    var acout = fs.createWriteStream('./acronym_out.log');
    var acerr = fs.createWriteStream('./acronym_err.log');
    process.stdout.write = acout.write.bind(acout);
    process.stderr.write = acerr.write.bind(acerr);
}


//console.log(process.env.BOT_TOKEN);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => { // request, response, next
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, cache-control");
    return next();
});

var port = process.env.PORT || 8000; // set our port
var router = require("./src/routing");

//add-on to the IP address and port #, for minor security and/or personal flair
app.use("/", router);

//Tell the application to listen on the port # you specified above
var server = app.listen(port);
console.log("Express server listening on port %d in %s mode. ", port, app.settings.env);
