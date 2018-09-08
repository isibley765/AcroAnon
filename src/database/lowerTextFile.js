const fs = require("fs");

function lowerFile(path) {
    fs.readFile(path, (err, data) => {
        if(err)
            throw err
        
        console.log(data.toString().split("\r\n"))
        
        fs.writeFile(path, data.toString().toLowerCase(), (err) => {
            if(err)
                throw err
            
            console.log("File text all lowercase now");
        })
    })
}

lowerFile("./src/database/dictionary_backup/en1.txt");