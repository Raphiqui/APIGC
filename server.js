const express = require('express');
const mongoose = require('mongoose');
const cproxy = require('colour-proximity');
const cors = require('cors');
const csv = require('csv-parser');
const convert = require('color-convert');
const database = require('./data/db.json');
const fs = require('fs');
const app = express();
const vision = require('@google-cloud/vision');
const credentials = require('./data/credentials.json');
const download = require('image-downloader');
const client = new vision.ImageAnnotatorClient({
    credentials
});

app.use(cors());

app.get('/api/setUp', async (req, res) => {

    const fetchAll = () => {
        return new Promise((resolve, reject) => {

            const results = [];

            fs.createReadStream('./data/products_eb.csv')
                .pipe(csv({separator: ';'}))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    mongoose.connect(database.dbURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
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
                            dbo.collection("products").insertOne(result, function (err, res) {
                                if (err) {throw err;} else {
                                    console.log("1 document inserted");
                                    resolve(true)
                                }
                            });
                        })
                    });
                });
        });
    };

    await fetchAll();

    res.send(true)
});

app.get('/api/updateDomColor', async (req, res) => {
    /**
     * Will interrogate the google cloud api about an url given as parameter then fetch the most dominant color
     * @param image: string corresponding to an image's url
     * @returns {Promise<*>} the response from the api
     */
    const fetchColor = async (image) => {
        // Performs label detection on the image file
        const [result] = await client.imageProperties(image);

        if (result.imagePropertiesAnnotation) {
            const colors = result.imagePropertiesAnnotation.dominantColors.colors;
            console.log("Fetch color for record");
            return colors[0]
        }else{
            return null
        }
    };

    /**
     *
     * @param url
     * @returns {Promise<void>}
     */
    const bufferImage = async (url) => {

        const options = {
            url: url,
            dest: './data/images'
        };

        const {filename, image} = await download.image(options);
        return filename
    };

    /**
     * After connecting to the database fetches the object containing the dominant color in order to update the correct
     * record into the database with its dominant color
     * @returns {Promise<any>}
     */
    const updateRecords = () => {

        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }

                /**
                 * Interrogate the database then foreach record found, compute to update it with the object
                 * containing the dominant color
                 */
                db.collection('products').find({}).forEach(async doc => {

                    try {
                        const localImg = await bufferImage(doc.photo);
                        const promise = await fetchColor(localImg);
                        const update = {dom_color: promise};

                        db.collection('products').updateOne(
                            {id: doc.id},
                            {$set: update},
                            {upsert: true, new: true}, (err, result) => {
                                if (err) {
                                    throw err;
                                }else{
                                    resolve(true)
                                }
                            })
                    }catch (e) {
                        console.log(e)
                    }
                })
            });
        });
    };

    const fetchNewRecords = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }

                db.collection('products').find().limit.toArray((err, result) => {
                    if (err !== null) {
                        throw err;
                    }else{
                        resolve(result)
                    }
                })
            });
        });
    };

    /**
     *
     * @returns {Promise<void>}
     */
    const asyncFunction = async () => {
        try {await updateRecords();}catch (e) {console.log(e)}
        try {
            const records = await fetchNewRecords();
            res.send(records)
        } catch (e) {
            console.log(e);
        }

    };

    try {
        asyncFunction();
    } catch (e) {
        console.log(e)
    }

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
                    if (result.length !== 0 && result[0].dom_color) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
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
                        throw err;
                    }
                });
            });
        });
    };

    /**
     *
     * @returns {Promise<any>}
     */
    const getProducts = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(database.dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
                if (err) {
                    throw err;
                }
                const dbo = db.db;

                dbo.collection('products').find().toArray((err, result) => {
                    if (err === null) {
                        resolve(result);
                    } else {
                        throw err;
                    }
                });
            });

        });
    };

    try {
        const check = await checkID();

        /**
         * If the user's input is into the db then compute to find which record's color is matching (92%)
         * with the user's input record and return it as an array. Otherwise display an error message
         */
        if (check){
            const color = await fetchInputRecord();
            const products = await getProducts();

            const hexColor = '#' + convert.rgb.hex(color.red, color.green, color.blue);

            const photoURLs = [];

            products.map(item => {
                if (item.dom_color){

                    // Get the color as hexadecimal format
                    const hexColor0 = '#' + convert.rgb.hex(item.dom_color.color.red, item.dom_color.color.green, item.dom_color.color.blue);

                    // Compute the proximity percentage between two colors
                    let result = cproxy.proximity(hexColor, hexColor0);

                    result = 100 - result;

                    if(result > 92){
                        photoURLs.push(item.photo)
                    }
                }

            });

            res.send(photoURLs)

        }else{
            res.send('After checking this id is not correct, not into the database or record not containing dominant color!')
        }
    } catch (e) {
        console.log(e)
    }

});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});