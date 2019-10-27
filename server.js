const express = require('express');
const path = require('path');
const app = express();

app.get('/api/item/:test', (req, res) => {
    const { test } = req.params;
    console.log(test);
    res.send('Param ' + test)
});

app.listen(process.env.PORT || 3053, () => {
    console.log("Listening on port: 3053")
});