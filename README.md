# AcroAnon
Taking a closer look at Slack

## Using ngrok
### Necessary for this to work locally! (Mine is installed to my path)

1. ngrok http 9483
2. node application.js

This should allow you to run the application locally. You will need to readjust any slack apps or slash commands that are directed at ngrok, as ngrok will only stay on a constant domain name if you're on the paid plan.

Just a simple setting change.

## Getting RTM Bot Messages, through the App Interface

Find _Event Subscriptions_ above _Bot Users_ on your Slack App page, and insert the appropriate URL for your application.

## You'll need a tokens.env file

This will allow for private user variables. The current configuration has three fields:

- `BOT_TOKEN`
- `OAUTH_ACCESS_TOKEN`
- `GOOGLE_SHEET`

The first two can be found on the Slack App webpage under _OAuth & Permissions_, while the second is a chunk of the google sheet's url itself; for  more information, please read [this link](https://www.twilio.com/blog/2017/03/google-spreadsheets-and-javascriptnode-js.html), and remember that the bot needs to have permission to view the sheet itself -- I added it directly, after the registering from the provided link gave my bot an ~~email~~ address of _sheetsacrocheck@sheets-api-test-208807.iam.gserviceaccount.com_

## Present Slash Commands

We've got:
1. `/aausertest`
2. `/whatisiandoing`
3. `/aacheckacro _ACRONYM`_
4. `/aanewacro _ACRO A Corn Rolled Over`
They should autocomplete for you as you type them, once you're locked in on one you can just press `tab` to finish, and then add the parameters.
### Examples:

- To submit a new acronym, `/aanewacro` needs the acronym first, and then the acronym expansion second, like `/aanewacro IW It Works`
- To check whether a previous acronym exists, or how many variants it has, type `/acheckacro MITB`
