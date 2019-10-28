const mongoose = require('mongoose');
const vision = require('@google-cloud/vision');
const credentials = require('./data/credentials.json');
const database = require('./data/db.json');
const client = new vision.ImageAnnotatorClient({
    credentials
});

/**
 * Will interrogate the google cloud api about an url given as parameter then fetch the most dominant color
 * @param image: string corresponding to an image's url
 * @returns {Promise<*>} the response from the api
 */
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

/**
 *
 * @returns {Promise<void>}
 */
const asyncFunction = async () => {
    const a = await updateRecords();
};

/**
 * Main function of the file
 */
asyncFunction();
