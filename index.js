const fs = require('fs');
const csv = require('fast-csv');
let list = [];
let myData ;

fs.createReadStream('./data/products_eb.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', row => console.log(row));
