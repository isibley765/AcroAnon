const express = require("express");
const router = express.Router(); // get an instance of the express Router
const Messager = require("./sendMessages.js");
const SheetInteract = require("./googleSpreadsheet.js");

var connection = new Messager();
var sheet = new SheetInteract(process.env.GOOGLE_SHEET);


// middleware to use for all requests ------------------------------------------
router.use(function(req, res, next) {
    // do logging
    // console.log("Server in use");
    // console.log(req.body);
    if(req.body.token == "9kHa0bEYRCrdo6pWtrBs0qdQ" || req.body.token == "YmX18PG2dc1FSye7P8ndvt0Q") {
        next(); // make sure we go to the next routes and don't stop here
    } else {
        console.log("Token "+req.body.token+" didn't match\n", req.body);
        res.status(200).json({
            response_type: "in_channel",
            text: "The token didn't match the one saved on my side, please contact your friendly neighborhood Slack App guy",
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
        res.status(200).send();
        var text = req.body.text.split(" ", 1)[0];

        connection.sendEphemeral({
            token: process.env.BOT_TOKEN,
            channel: (req.body.channel_name == "directmessage"? req.body.user_id : req.body.channel_id),
            user: req.body.user_id,
            as_user: true,
            text: "Searching for acronym \""+text+"\"...",
        });

        setTimeout(() => {
            sheet.findAcronym(text, (err, data) => {
                // console.log("Data:\n", data);
                var message = {
                    token: process.env.BOT_TOKEN,
                    channel: (req.body.channel_name == "directmessage"? req.body.user_id : req.body.channel_id),
                    user: req.body.user_id,
                    as_user: true
                };

                if (err) {
                    console.error(err);
                    message.text = "Search error likely, check your input.";
                } else {

                  if (data.exists) {
                    message.text = "This acronym has the following extension" + ( (data.occur.length>1) ? "s:" : ":" );

                    data.occur.forEach((extension, indx) => {
                        message.text += "\n• "+extension;
                    });
                  } else {
                    message.text = "No acronym exists under this name...";
    /*
                    message.attachments = [ // Looks like attachments require JSON formatting, but the authentication doesn't go through correctly as JSON still
                      {
                        fallback: "Type `/aamakeacro _acronym description_` to add a new acronym",
                        title: "Would you like to add one?",
                        callback_id: "new_acro_checking",
                        actions: [
                          {
                            name: "makenewacro",
                            text: "Yes",
                            type: "button",
                            value: "yes"
                          },
                          {
                              name: "nonewacro",
                              text: "No",
                              type: "button",
                              value: "no"
                          }
                        ]
                      }
                    ];*/
                  }

                  // console.log(message);

                  connection.sendEphemeral(message);
                }
            });
        }, 50);   // To ensure the order of the messages sent above... Will trade to callbacks later
    });

  router.route("/acronym/add/")
    .post((req, res) => {
        // console.log(req.body);

        res.status(200).send();

        var regex = /(.+?) (.+)/;   // We're being very liberal here for now
        var text = [];
        var parse = regex.exec(req.body.text);

        if (parse) {
          text.push(parse[1]);
          text.push(parse[2]);
        }

        var message = {
            token: process.env.BOT_TOKEN,
            channel: (req.body.channel_name == "directmessage"? req.body.user_id : req.body.channel_id),
            as_user: true
        };

        if (text.length != 2 || text[0].length > text[1].length) {
            message.text = "Invalid input, please enter two parameters like `_ACRONYM Acronym Extension_`, no more, no less";
            connection.sendReply(message);
        } else {
            message.text = "Submitting acronym "+text[0]+"...";
            connection.sendReply(message);

            sheet.findAcronym(text[0], (err, definitions) => {

                if(err) {
                  console.error(err);
                  message.text = "There was an error checking if the acronym/definition pair already exist";
                  connection.sendReply(message);
                } else {
                    if (!definitions.exists || !definitions.occur.includes(text[1])) {
                        sheet.insertRow(text[0], text[1], (err) => {
                            // console.log(err);
                            if(!err) {
                                message.text = "Acronym sucessfully submitted to the Google Sheet :sunglasses:"
                            } else {
                                message.text = "Acronym submission failed... :pensive:\nContact your local Software Guru, and/or do it the hard way in the meantime";
                            }

                            connection.sendReply(message);
                        });
                    } else {
                        message.text = "This acronym/definition pair already exist";
                        connection.sendReply(message);
                    }
                }
            });

        }
    })

router.route("/events/")
    .get((req, res) => {
        res.status(200).send("We take Post-It notes only");
    })
    .post((req, res) => {
        // console.log(req.body);
        if(req.body.type == "url_verification") {
            res.status(200).json({"challenge": req.body.challenge});    // Connect with me plz
            return;
        } else {
            res.status(200).send();     // Slack needs to know it's ok even when it's not

            if(req.body.event.type == "message") {
                // console.log(req.body);

                if (req.body.type == "event_callback" && !req.body.event.bot_id && !req.body.event.command && req.body.event.channel_type == "channel") {   //if it's an event callback, not a command, and not a bot's message...
                    //console.log(req.body);      // In case I want to see when a new post comes through
                    var message = {
                        token: process.env.BOT_TOKEN,
                        channel: req.body.event.channel,
                        text: "I hear you",
                        thread_ts: req.body.event.ts,

                    };

                    connection.sendReply(message);

                }
            } else if(req.body.event.type == "channel_created") {   // Tag channel creator to remind them to add AcroAnon if they want its help
                var message = {
                    token: process.env.BOT_TOKEN,
                    channel: req.body.event.channel.creator,
                    text: "If you'd like my help, please make sure you add me to the new channel "+req.body.event.channel.name,
                    thread_ts: req.body.event.ts,

                };

                connection.sendReply(message);
            }
        }
    });

module.exports = router;
