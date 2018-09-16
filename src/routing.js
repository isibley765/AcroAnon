const express = require("express");
const router = express.Router(); // get an instance of the express Router
const RouterDo = require('./routerFunctions.js');

var routerdo = new RouterDo();


// middleware to use for all requests ------------------------------------------
router.use(function(req, res, next) {
    // do logging
    // console.log("Server in use");
    // console.log(req.body);
    if(req.body.token == "9kHa0bEYRCrdo6pWtrBs0qdQ" || req.body.token == "YmX18PG2dc1FSye7P8ndvt0Q") {
        next(); // make sure we go to the next routes and don't stop here
    } else if (req.body.token != undefined) {
        console.error("Token "+req.body.token+" didn't match\n", req.url, "\n", req.body, "\n-------------------------------\n");
        res.status(200).json({
            response_type: "in_channel",
            text: "Invalid request or bad/non-existant token, please contact your friendly neighborhood Slack App guy",
            sent: req.body
        });
    }
});

// We create a function which handles any requests and sends a simple response
router.route("/whatisup/")
    .get((req, res) => { // GET requests respond with Hello World
        res.send("Things are looking good");
    })
    .post((req, res) => {   // The first message for responding with a slash command -- if it's quick, it can just be a response
        res.status(200).json({
            response_type: "in_channel",
            text: "It's working!!!",
            attachments: [
                {
                    text: "Ian is now playing a dangerous game..."
                }
            ]
        });
        //res.json({ message: 'Hello World!' }); // Turns structures into a string
        // JavaScript Object Notatrouterdo.ion
        // Can be parsed out by more than JavaScript (Python, etc)
    });

router.route("/slack/userTest/")
    .post((req, res) => {
        routerdo.postUserTest(req, res);
    });

router.route("/acronym/check/")
    .post((req, res) => {
        routerdo.postAcronymCheck(req, res);
    });

  router.route("/acronym/add/")
    .post((req, res) => {
        routerdo.postAddAcronym(req, res);
    });

router.route("/acronym/help/")
    .post((req, res) => {
        routerdo.giveHelp(req, res);
    });

router.route("/events/")
    .get((req, res) => {
        routerdo.getEvents(req, res);
    })
    .post((req, res) => {
        routerdo.postEvents(req, res);
    });

module.exports = router;
