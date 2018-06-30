var express = require("express");
var router = express.Router(); // get an instance of the express Router

var connection = require("./sendMessages.js");


// middleware to use for all requests ------------------------------------------
router.use(function(req, res, next) {
    // do logging
    // console.log("Server in use");
    if(req.body.token == "9kHa0bEYRCrdo6pWtrBs0qdQ" || req.body.token == "YmX18PG2dc1FSye7P8ndvt0Q") {
        next(); // make sure we go to the next routes and don't stop here
    } else {
        console.log("Token didn't match");
        console.log(req);
        res.status(200).json({
            "response_type": "in_channel",
            "text": "The token didn't match the one saved on my side, please contact your friendly neighborhood Slack App guy",
            "sent": req.body
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
            "response_type": "in_channel",
            "text": "It's working!!!",
            "attachments": [
                {
                    "text": "Ian is now playing a dangerous game..."
                }
            ]
        });
        //res.json({ message: 'Hello World!' }); // Turns structures into a string
        // JavaScript Object Notation
        // Can be parsed out by more than JavaScript (Python, etc)
    });

router.route("/slack/userTest/")
    .post((req, res) => {
        if (req.body.token == "YmX18PG2dc1FSye7P8ndvt0Q") { // Outdated, leaving this here for logic with different slash command
            connection.slashUserTest(req, res);
        }
    });

router.route("/acronym/check/")
    .post((req, res) => {
        res.status(200).json({
            "response_type": "in_channel",
            "text": "Acronyms can't be saved yet, so no acronym is known",
        })
    });

router.route("/events/")
    .get((req, res) => {
        res.status(200).send("We take Post-It notes only");
    })
    .post((req, res) => {

        if(req.body.type == "url_verification") {
            res.status(200).json({"challenge": req.body.challenge});    // Connect with me plz
            return;
        } else if (req.body.type == "event_callback" && req.body.event.subtype != "bot_message") {
            //console.log(req.body);      // In case I want to see when a new post comes through
            var message = {
                token: process.env.BOT_TOKEN,
                channel: req.body.event.channel,
                text: "I hear you",
                thread_ts: req.body.event.ts,

            };
            
            connection.threadReply(message);

        }

        res.status(200).send();     // Slack needs to know it's ok even when it's not
    });

module.exports = router;