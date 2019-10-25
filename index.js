const csv = require('csv-parser');
const fs = require('fs');
const results = [];

fs.createReadStream('./data/products_eb.csv')
    .pipe(csv({separator: ';'}))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(results);
        console.log(results.length)
    });

