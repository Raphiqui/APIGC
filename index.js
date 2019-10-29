const csv = require('csv-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const results = [];
const database = require('./data/db.json');

/**
 * Creation of a stream used to read the csv file given then fulfill the database with all the row from the csv
 */
fs.createReadStream('./data/products_eb.csv')
    .pipe(csv({separator: ';'}))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                throw err;
            }

            console.log('connected to ' + database.dbURL);

            const dbo = db.db;

            // Drop the previous collection or do nothing if there is not previous one
            dbo.dropDatabase(err => {
                if (err === null) {
                    console.log('BDD cleaned');
                } else {
                    console.log(err);
                }
            });

            // Fulfill the collection with the records
            results.map((result) => {
                result.photo = 'http:' + result.photo;
                dbo.collection("products").insertOne(result, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                });
            });

            db.close();
        });
});



