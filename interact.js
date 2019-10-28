const mongoose = require('mongoose');
const vision = require('@google-cloud/vision');
const credentials = require('./data/credentials.json');
const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';
const client = new vision.ImageAnnotatorClient({
    credentials
});

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

    return new Promise((resolve, reject) => {
        mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                throw err;
            }
            const dbo = db.db;

            db.collection('products').find({}).limit(20).forEach(async doc => {
                const photoUrl = 'http:' + doc.photo;
                const promise = await fetchColor(photoUrl);
                const update = {dom_color: promise};

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
        });
    });
};

const asyncFunction = async () => {
    const a = await getURL();
};

asyncFunction();
