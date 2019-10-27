const express = require('express');
const mongoose = require('mongoose');
const cproxy = require('colour-proximity');
const convert = require('color-convert');
const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';
const app = express();
const storage = require('./interact.js');


app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    if (storage.indexOf(id) > -1) {
        const getTest = () => {
            return new Promise((resolve, reject) => {
                mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                    if (err) {
                        throw err;
                    }
                    const dbo = db.db;

                    dbo.collection('products').find({ id: id }).limit(1).toArray((err, result) => {
                        if (err === null) {
                            console.log(result[0].dom_color.color);
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
        console.log(hexColor);
        let result = cproxy.proximity("#ffffff",hexColor);

        result = 100 - result;

        if(result > 90){
            console.log('Matching higher than 90% with :', result);
        }else{
            console.log('Matching lesser than 90% with :', result);
        }

        res.send('Pong')
    } else {
        res.send('Wrong id')
    }


});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});