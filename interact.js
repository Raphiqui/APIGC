const mongoose = require('mongoose');
const vision = require('@google-cloud/vision');
const credentials = require('./data/credentials.json');
const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';
const client = new vision.ImageAnnotatorClient({
    credentials
});

const storage = [];

fetchColor = async (image) => {
    // Performs label detection on the image file
    const [result] = await client.imageProperties(image);

    console.log(result);

    if (result.imagePropertiesAnnotation) {
        const colors = result.imagePropertiesAnnotation.dominantColors.colors;
        // colors.forEach(color => console.log(color));
        console.log(colors[0]);

        return colors[0]
    }else{
        return null
    }
};

const getURL = () => {

    // const storage2 = [];

    return new Promise((resolve, reject) => {
        mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                throw err;
            }
            const dbo = db.db;

            db.collection('products').find({}).limit(20).forEach(async doc => {
                storage.push(doc.id);
                // storage2.push(doc);
                const photoUrl = 'http:' + doc.photo;
                const promise = await fetchColor(photoUrl);
                const update = {dom_color: promise};

                console.log(update);

                db.collection('products').updateOne(
                    {id: doc.id},
                    {$set: update},
                    {upsert: true, new: true}, (err, result) => {
                        if (err) {
                            console.log(err);
                            reject(err)
                        }
                    })
            });

            // db.close()
        });
    });
};

// const trololo = async (array) => {
//     array.map(async item => {
//         const photoUrl = 'http:' + item.photo;
//         const response = await fetchColor(photoUrl);
//         item['dom_color'] = response;
//     });
//
//     return array;
// };

const asyncFunction = async () => {
    const a = await getURL();
    // const b = await trololo(a);
};

asyncFunction();

// fetchColor("http://image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/default/L1212_001_24.jpg?sw=458&sh=443");

module.exports = storage;
