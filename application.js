// First we need to install our server library (express), and tell the app how to interpret incoming data (body-parser)
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) { // request, response, next
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, cache-control");
    return next();
});

var port = process.env.PORT || 9483; // set our port
var router = express.Router(); // get an instance of the express Router

// middleware to use for all requests ------------------------------------------
router.use(function(req, res, next) {
    // do logging
    // console.log("Server in use");
    next(); // make sure we go to the next routes and don't stop here
});

// We create a function which handles any requests and sends a simple response
router.route("/whatisup/")
    .get((req, res) => {
        res.send("Things are looking good");
    })
    .post((req, res) => { // GET requests respond with Hello World
        console.log(req.body.token == "9kHa0bEYRCrdo6pWtrBs0qdQ");
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

router.route("/slack/command/")
    .post((req, res) => {
        if (req.body.token == "YmX18PG2dc1FSye7P8ndvt0Q") {
            var regex = /<@([A-Z0-9]+)\|?[a-zA-Z0-9]*?>/g;
            var people = regex.exec(req.body.text);

            var message = {"text": "Hey", "present": false};

            // console.log(regex.exec(req.body.text));

            while(people != null) {
                console.log(people);

                if (people[1]) {
                    message.text = message.text + " " + "<@" + people[1] + ">";
                    message.present = true;
                }

                people = regex.exec(req.body.text)
            }

            if (message.present) {
                res.status(200).json({
                    "response_type": "in_channel",
                    "text": message.text+", I did a thing"
                })
            } else {
                res.status(200).json({
                    "response_type": "in_channel",
                    "text": "This is science, please respect the arts"
                })
            }
        }
    });

//add-on to the IP address and port #, for minor security and/or personal flair
app.use("/", router);

//Tell the application to listen on the port # you specified above
server = app.listen(port);
console.log("Express server listening on port %d in %s mode. ", port, app.settings.env);