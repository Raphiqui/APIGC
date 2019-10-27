const express = require('express');
const mongoose = require('mongoose')
const path = require('path');
const cproxy = require('colour-proximity');
const convert = require('color-convert');
const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';
const app = express();

app.get('/api/item/:test', async (req, res) => {
    const { test } = req.params;
    console.log('hello')
    const getTest = () => {
        console.log('hello')
        return new Promise((resolve, reject) => {
            mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }
                const dbo = db.db;
                console.log('hello')
                dbo.collection('products').find({}).limit(1).toArray((err, result) => {
                    if (err === null) {
                        resolve(result[0].dom_color.color);
                    } else {
                        console.log(err);
                        reject(err);
                    }
                });
            });
        });
    };

    const color = await getTest();
    const hexColor = '#' + convert.rgb.hex(color.red, color.green, color.blue);
    const result = cproxy.proximity("#ffffff",hexColor);

    console.log('Result:', result);

    res.send('Pong')
});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});