# AcroAnon
Taking a closer look at Slack

## Using ngrok
### Necessary for this to work locally! (Mine is installed to my path)

1. ngrok http 9483
2. node application.js

This should allow you to run the application locally. You will need to readjust any slack apps or slash commands that are directed at ngrok, as ngrok will only stay on a constant domain name if you're on the paid plan.

Just a simple setting change.
