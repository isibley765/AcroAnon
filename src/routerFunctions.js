const Messager = require("./sendMessages.js");
const SheetInteract = require("./googleSpreadsheet.js");

var connection = new Messager();
var sheet = new SheetInteract(process.env.GOOGLE_SHEET);


module.exports = class RouterDo {
    constructor() {

    }

    postUserTest(req, res) {     // Just a test, finds all the users sent with the command as parameters
        res.status(200).send();

        var message = {
            token: process.env.BOT_TOKEN,
            channel: (req.body.channel_name == "directmessage" ? req.body.user_id : req.body.channel_id),
            text: "Hey look, I did a thing, and only you can see it :smirk:",
            as_user: false,
            username: "AAron",
            icon_emoji: ":blendiplier:",
            //attachments: 	[{"pretext": "pre-hello", "text": "text-world"}]
        };

        var regex = /<@([A-Z0-9]+)\|?[a-zA-Z0-9]*?>/g;
        var people;
        var found = {"people": [], "present": false};

        while(people = regex.exec(req.body.text)) {
          if (people[1]) {
                found.people.push(people[1]);
                found.present = true;
            }
        }

        if (found.present) {  //Again, as long as the response is quick, can just respond to a slash command
            found.people.forEach((val, ind) => {
                message.user = val;
                message.channel = (req.body.channel_name == "directmessage" ? val : req.body.channel_id);

                connection.sendEphemeral(message);
            });
        } else {
            message.text = "Please respect your local sciences";

            connection.sendReply(message);
        }
    }

    postAcronymCheck(req, res) {
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
                    }

                    connection.sendEphemeral(message);
                }
            });
        }, 50);   // To ensure the order of the messages sent above
    }

    postAddAcronym(req, res) {
        // console.log(req.body);

        res.status(200).send();

        var regex = /(.+?) (.+)/;   // We're being very liberal here for now
        var text = [];
        var parse = regex.exec(req.body.text);

        if (parse) {
          text = [parse[1], parse[2]];
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
    }

    getEvents(req, res) {
        res.status(200).send("We take Post-It notes only");
    }

    postEvents(req, res) {
        if(req.body.type == "url_verification") {
            res.status(200).json({"challenge": req.body.challenge});    // Connect with me plz
            return;
        } else {
            res.status(200).send();     // Slack needs to know it's ok even when it's not

            if(req.body.event.type == "message") {

                if (req.body.type == "event_callback" && !req.body.event.bot_id && !req.body.event.command && req.body.event.channel_type == "channel") {   //if it's an event callback, not a command, and not a bot's message...
                    this.findAcronym(req, res);

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
    }

    findAcronym(req, res) {     // When checking
        var message = {
            token: process.env.BOT_TOKEN,
            channel: req.body.event.channel,
            text: "I hear you",
            thread_ts: req.body.event.ts,
        };

        var acroFilter = /[A-Z0-9](([a-z]{1,3}[A-Z])|([A-Z0-9])){2,}/g;
        // mentioning someone in a commennt avoided here, typically comes in a form of '<@UDKF40R33|Johnny Cash>
        var numberFilter = /[^\d]/;    // in JS, \d == [0-9] explicitly, according to Stack Overflow

        
        var acro;
        var found = {"acros": [], "present": false};

        while(acro = acroFilter.exec(req.body.text)) {
            // easy TODO: make sure match isn't only numbers
            if (acro[0]) {
                found.acros.push(acro[0]);
                found.present = true;
            }
        }

        
        
        if (found.present) {
            message.text = "We found an acronym or two in your text. Currently working to have memory if it's already been submitted, or is a false positive, please stay tuned!"
            connection.sendEphemeral(message);
        }

        /*
            TODO:
                1. Check against known acronyms
                2. Check against dictionary (lower to lower, local or otherwise)
                3. Make the user (privately?) aware if something passes
                4. Find make attachments work for messages (switch already flipped?)
            
            Extended TODO:
                1. Database, for language(s), known acronyms, non-ROV acronyms, and possibly ignore cases
                2. Compare matches to known, ignored and non-ROV acros, and then words(lang)
                    - Possibly that order? Speed?
                3. Make trie from database for valid local acronyms
                    - Might make of all acronyms, languages possibly too big for holding in RAM if thorough
                4. Compare against trie instead of database (cause why not)
                5. Implement self-updating, and manual updating
            
            Outside TODO:
                1. Check acronym submission for worst starting with acronym letters in order
                2. Explore function wrapping
                    - auto-print errors without retyping same code, etc
                3. Default message object generation
                    - Again, for minimizing code lines
                    - Potentially object copying, for functions needing aditional parameters to the basic message
                    - must regenerate every time, regardless of default or not
                4. Parallel operations/threading/node spawning?
                    - Especially if speed starts looking like a concern
        */
    }
}
