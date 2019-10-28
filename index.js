const csv = require('csv-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const results = [];

const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';

fs.createReadStream('./data/products_eb.csv')
    .pipe(csv({separator: ';'}))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                throw err;
            }
            console.log('connected to ' + dbURL);

            const dbo = db.db;

            dbo.dropDatabase(err => {
                if (err === null) {
                    console.log('BDD cleaned');
                } else {
                    console.log(err);
                }
            });

            results.map((result) => {
                dbo.collection("products").insertOne(result, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                });
            });

            db.close();
        });
});



