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
                console.error("Reply error\n", err, "\n", mess, "\n-------------------------------\n");
            } else if (!data.body.ok) {
                console.error("Reply error\n", data.body, "\n", mess, "\n-------------------------------\n");
            } // else silent please....
        });
    }

    sendEphemeral (mess) {
        needle.request('post', 'https://slack.com/api/chat.postEphemeral', mess, {json: false}, (err, data) => {
            if (err) {
                console.error("Ephemeral error\n", err, "\n", mess, "\n-------------------------------\n");
            } else if (!data.body.ok) {
                console.error("Ephemeral error\n", data.body, "\n", mess, "\n-------------------------------\n");
            } // else silent please....
        });
    }
}

module.exports = Messaging;
