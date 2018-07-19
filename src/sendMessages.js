const needle = require("needle");


class Messaging {
    constructor () {
        needle.request('get', 'https://slack.com/api/users.list', {token: process.env.BOT_TOKEN}, {json: false}, (err, data) => {
            if (err) {
                console.error(err);
            } else if (!data.body.ok) {
                console.error(data.body);
            } else {
                data.body.members.forEach((user, indx) => {   //Don't know that I need this
                    if (user.is_bot && user.name == "aa_botman") {  // Better only be one...
                        process.env.BOT_ID = user.profile.bot_id;
                    }
                })
            }
        });
    }

    sendReply (mess) {
        // console.log(mess);
        needle.request('post', 'https://slack.com/api/chat.postMessage', mess, {json: false}, (err, data) => {
            if (err) {
                console.error("Reply error\n", err, "\n", mess, "-------------------------------\n");
            } else if (!data.body.ok) {
                console.error("Reply error\n", data.body, "\n", mess, "-------------------------------\n");
            } // else silent please....
        });
    }

    sendEphemeral (mess) {
        needle.request('post', 'https://slack.com/api/chat.postEphemeral', mess, {json: false}, (err, data) => {
            if (err) {
                console.error("Ephemeral error\n", err, "\n", mess, "-------------------------------\n");
            } else if (!data.body.ok) {
                console.error("Ephemeral error\n", data.body, "\n", mess, "-------------------------------\n");
            } // else silent please....
        });
    }

    slashUserTest (req, res) {     // Just a test, finds all the users sent with the command as parameters
        res.status(200).send();

        var message = {
            token: process.env.BOT_TOKEN,
            channel: (req.body.channel_name == "directmessage"? req.body.user_id : req.body.channel_id),
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

        // console.log(req.body.text);

        if (found.present) {  //Again, as long as the response is quick, can just respond to a slash command
            found.people.forEach((val, ind) => {
                message.user = message.channel = val;

                // console.log(message);

                this.sendEphemeral(message);
            });
        } else {
            message.text = "Please respect your local sciences";

            // console.log(message);

            this.sendReply(message);
        }
    }
}

module.exports = Messaging;
