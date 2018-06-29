from flask import Flask
import json
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/whatisup/')
def hello_slack():
    return json.dumps({
        "response_type": "in_channel",
        "text": "It's working!!!",
        "attachments": [
            {
                "text": "Ian is now playing a dangerous game..."
            }
        ]
    })

if __name__ == "__application__":
    app.run(debug=True)