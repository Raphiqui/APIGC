const express = require('express');
const path = require('path');
const app = express();

app.get('/ping', (req, res) => {
    console.log('up');
    res.send('pong')
});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});