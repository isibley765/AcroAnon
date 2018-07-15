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
                    if (user.is_bot && user.name == "aa_botman") {
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
                console.error(err);
            } else if (!data.body.ok) {
                console.error(data.body);
            } // else silent please....
        });
    }

    slashUserTest (req, res) {     // Finds all the users sent with the command as parameters, just a test
        res.status(200).send();

        var message = {
            token: process.env.BOT_TOKEN,
            channel: (req.body.channel_name == "directmessage"? req.body.user_id : req.body.channel_id),
            text: "Hey look, I did a thing, and only you can see it :smirk:",
            as_user: false,
            username: "AAron",
            icon_emoji: ":mur:"
            //attachments: 	[{"pretext": "pre-hello", "text": "text-world"}]
        };

        var regex = /<@([A-Z0-9]+)\|?[a-zA-Z0-9]*?>/g;
        var people;

        var found = {"people": [], "present": false};

        // console.log(regex.exec(req.body.text));

        while(people = regex.exec(req.body.text)) {
            // console.log(people);

            if (people[1]) {
                found.people.push(people[1]);
                found.present = true;
            }

        }

        if (found.present) {  //Again, as long as the response is quick, can just respond to a slash command
            found.people.forEach((val, ind) => {
                message.user = val;

                // console.log(message);

                this.sendEphemeral(message);
            });
        } else {
            message.text = "Please respect your local sciences";

            // console.log(message);

            this.sendReply(message);
        }
    }

    sendEphemeral (mess) {
        needle.request('post', 'https://slack.com/api/chat.postEphemeral', mess, {json: false}, (err, data) => {
            if (err) {
                console.error(err);
            } else if (!data.body.ok) {
                console.error(data.body);
            } // else silent please....
        });
    }
}

module.exports = Messaging;
