const express = require('express');
const mongoose = require('mongoose');
const cproxy = require('colour-proximity');
const cors = require('cors');
const convert = require('color-convert');
const database = require('./data/db.json');
const app = express();

let a = [];

app.use(cors());

app.get('/api/fetchIDs', async (req, res) => {
    const fetchAll = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }
                const dbo = db.db;

                dbo.collection('products').find().limit(100).toArray((err, result) => {
                    if (err === null) {
                        resolve(result);
                    } else {
                        console.log(err);
                        reject(err);
                    }
                });

            });
        });
    };

    const records = await fetchAll();

    res.send(records)
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    /**
     * Check if the id corresponding to the user's input exists into the database
     * @returns {Promise<any>} boolean
     */
    const checkID = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }
                const dbo = db.db;

                dbo.collection('products').find({ id: id }).toArray((err, result) => {
                    if (result.length !== 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });

                db.close();
            });
        });
    };

    /**
     * Fetch the dominant color of the record linked to the user's input
     * @returns {Promise<any>} object
     */
    const fetchInputRecord = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }
                const dbo = db.db;

                dbo.collection('products').find({ id: id }).limit(1).toArray((err, result) => {
                    if (err === null) {
                        resolve(result[0].dom_color.color);
                    } else {
                        console.log(err);
                        reject(err);
                    }
                });

                db.close();
            });
        });
    };

    /**
     *
     * @returns {Promise<any>}
     */
    const getTest1 = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }
                const dbo = db.db;

                dbo.collection('products').find().limit(20).toArray((err, result) => {
                    if (err === null) {
                        resolve(result);
                    } else {
                        console.log(err);
                        reject(err);
                    }
                });

                db.close();
            });

        });
    };

    const check = await checkID();

    /**
     * If the user's input is into the db then compute to find which record's color is matching (92%)
     * with the user's input record and return it as an array. Otherwise display an error message
     */
    if (check){
        const color = await fetchInputRecord();
        const b = await getTest1();

        const hexColor = '#' + convert.rgb.hex(color.red, color.green, color.blue);

        a = [];

        b.map(item => {
            if (item.dom_color){

                // Get the color as hexadecimal format
                const hexColor0 = '#' + convert.rgb.hex(item.dom_color.color.red, item.dom_color.color.green, item.dom_color.color.blue);

                // Compute the proximity percentage between two colors
                let result = cproxy.proximity(hexColor, hexColor0);

                result = 100 - result;

                if(result > 92){
                    console.log('Matching higher than 92% with :', result);
                    a.push("http:" + item.photo)
                }else{
                    console.log('Matching lesser than 92% with :', result);
                }
            }

        });

        res.send(a)

    }else{
        res.send('After checking this id is not correct !')
    }
});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});