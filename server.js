const express = require('express');
const mongoose = require('mongoose');
const cproxy = require('colour-proximity');
const convert = require('color-convert');
const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';
const app = express();
// const storage = require('./interact.js');

let a = [];

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    // if (storage.indexOf(id) > -1) {
    const getTest = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
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

    const getTest1 = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
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

    const color = await getTest();
    const b = await getTest1();

    const hexColor = '#' + convert.rgb.hex(color.red, color.green, color.blue);

    a = [];

    b.map(item => {
        if (item.dom_color){
            const hexColor0 = '#' + convert.rgb.hex(item.dom_color.color.red, item.dom_color.color.green, item.dom_color.color.blue);

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
    // } else {
    //     res.send('Wrong id')
    // }


});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});