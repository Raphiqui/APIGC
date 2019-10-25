const mongoose = require('mongoose');
const dataModel = require('./dataModel.js');

const dbURL = 'mongodb://127.0.0.1:27017/APIGCDB';

mongoose.connect(dbURL, (err, db) => {
    if (err) {
        throw err;
    }

    const dbo = db.db;

    dbo.dropDatabase(err => {
        if (err === null) {
            console.log('BDD cleaned');
        } else {
            console.log(err);
        }
    });

    const msg = new dataModel({
        csv_id: '9',
        title: 'This is a title',
        gender_id: 'WOM',
        composition: '6% Elasthanne',
        sleeve: 'Manches longues',
        photo: '//image1.lacoste.com/dw/image/v2/AAQM_PRD/on/demandware.static/Sites-FR-Site/Sites-master/default/PF7841_031_24.jpg?sw=458&sh=443',
        url: 'https://www.lacoste.com/fr/lacoste/femme/vetements/polos/polo-slim-fit-lacoste-a-manches-longues-en-mini-pique-stretch-/PF7841-00.html?dwvar_PF7841-00_color=031',
        test: 'A test',
    });

    msg.save()
        .then(() => {
            console.log('BDD initialized');
        })
        .catch(error => {
            console.error(error);
        });
});