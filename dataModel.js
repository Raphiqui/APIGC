const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    csv_id: String,
    title: String,
    gender_id: String,
    composition: String,
    sleeve: String,
    photo: String,
    url: String,
    test: String,
});

module.exports = mongoose.model('Data', DataSchema);