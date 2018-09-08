function colorprint(string, color) {
    var select = {
        reset: "0m",
        underscore: "4m",
        black: "30m",
        red: "31m",
        green: "32m",
        yellow: "33m",
        blue: "34m",
        magenta: "35m",
        cyan: "36m",
        white: "37m"
    }

    color = color ? color.toLowerCase() : "green";

    if (color in select) {
        console.log("\x1b["+select[color], string, "\x1b[0m");
    } else {
        console.log("\x1b["+select['red'], "Selected color is unavailable", "\x1b[0m");
        console.log(string);
    }
}

module.exports = colorprint;