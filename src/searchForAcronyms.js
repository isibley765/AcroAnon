

class aaSearchNFind {
    constructor(connection, sheet, acro) {
        // Preceded by start or space, and followed by a non-consuming check for space or end-of-line
        this.acroFilter = acro ? acro : /(^| )([A-Z0-9](([a-z]{1,3}[A-Z])|([A-Z0-9])){2,})(?= |$)/g;
        // mentioning someone OR A CHANNEL in a commennt avoided here, typically comes in a form of '<@UDKF40R33|Johnny Cash>'

        this.connection = connection;
        this.sheet = sheet;
    }

    parseAcronoyms(message, text) {
        var numberFilter = /[^\d]/;    // in JS, \d == [0-9] explicitly, according to Stack Overflow
        
        var acro;
        var found = {"acros": [], "present": false};

        while(acro = this.acroFilter.exec(text)) {
            // easy TODO: make sure match isn't only numbers
            if (acro[0] && numberFilter.exec(acro[0])) {
                found.acros.push(acro[0]);
                found.present = true;
            }
        }
        
        return found;
    }
}

module.exports = aaSearchNFind;