// const mongoose = require('mongoose');
// const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';
//
// const getURL = () => {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(dbURL, (err, db) => {
//             if (err) {
//                 throw err;
//             }
//             const dbo = db.db;
//
//             dbo.collection('products').find({}).toArray((err, result) => {
//                 if (err === null) {
//                     console.log(result);
//                     resolve(result[0]);
//                 } else {
//                     console.log(err);
//                     reject(err);
//                 }
//             });
//         });
//     });
// };
//
// const asyncFunction = async () => {
//     const a = await getURL();
//     console.log('A: ', a)
// };
//
// asyncFunction();
const vision = require('@google-cloud/vision');
const credentials = require('./data/credentials.json');

const client = new vision.ImageAnnotatorClient({
    credentials
});

async function quickstart() {
    // Performs label detection on the image file
    const [result] = await client.imageProperties('./data/test.jpg');
    const colors = result.imagePropertiesAnnotation.dominantColors.colors;
    colors.forEach(color => console.log(color));
}

quickstart();