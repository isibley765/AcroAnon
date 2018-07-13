const needle = require("needle");

var messaging = {
    threadReply: (mess) => {
        needle.request('post', 'https://slack.com/api/chat.postMessage', mess, {json: false}, (err, data) => {
            if (err) {
                console.log(err);
            } else if (!data.body.ok) {
                console.log(data.body);
                console.log("Thread reply above\n");
            } // else silent please....
        });
    },

    slashUserTest: (req, res) => {     // Finds all the users sent with the command as parameters, just a test
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

        if (message.present) {  //Again, as long as the response is quick, can just respond to a slash command
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
    },


}

module.exports = messaging;
