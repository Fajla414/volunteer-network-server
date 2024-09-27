const express = require('express');
const PORT = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());


const run = async () => {
    try {

        app.listen(PORT, console.log('server is running'));
    } catch (err) {
        console.log(err);
    }
}

run();