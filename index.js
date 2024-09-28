const express = require('express');
const PORT = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzsam.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const run = async () => {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const allDataCollection = database.collection('DATA');

        app.get('/', async (req, res) => {
            res.send('Hello World')
        })

        app.post('/addAllData', async (req, res) => {
           allDataCollection.insertMany(req.body).then(result => {
            console.log('Successfully addAllData')
            res.send(result);
           })

        })

        app.listen(PORT, console.log('server is running'));
    } catch (err) {
        console.log(err);
    }
}

run();