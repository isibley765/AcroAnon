const checkword = require("check-word");

const span = checkword('es');
const engl = checkword('en');

var aaSearch = {
    findAcronoyms: (text) => {
        var regex = /[A-Z]{3,}/g;
        var acronyms = [];
        var last;

        do {
            last = regex.exec(text);
            if (last && !engl.check(last[0].toLowerCase()) && !span.check(last[0].toLowerCase())) {
                acronyms.push(last[0]);
            }
        } while(last != null);

        return acronyms;
    }
}

/*
console.log(span.check("SOMETHING"));
console.log(engl.check("SOMETHING"));
console.log(engl.check("something"));
*/

console.log(aaSearch.findAcronoyms("SDF FAIR NO BAD (@*#HDLKFNS982323 AARDVARK AAA DEMONS"))