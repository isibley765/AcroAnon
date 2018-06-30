const needle = require("needle");

var data = {
    token: "xoxp-386887880259-386295521648-390350854853-c927d5c6295a942353cd384af7fc221c",
    channel: "CBH1Z2QLW",
    text: "I just want to live..."
}

needle.request('post', 'https://slack.com/api/chat.postMessage', data, {json: false}, (err, data) => {
    if (err) {
        console.log(err);
    }
    console.log(data.body);
});