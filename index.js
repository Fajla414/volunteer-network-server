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
        const allDataCollection = database.collection('ALLDATA');
        const registeredVolunteerCollection = database.collection('registeredVolunteer');
        //GET
        app.get('/', async (req, res) => {
            res.send('Hello World')
        })

        app.get('/getProducts', async (req, res) => {
            allDataCollection.find({}).toArray().then(result => {
                res.send(result);
            })
        })


        app.get('/collection', async (req, res) => {
            const queryEmail = req.query.email;
            registeredVolunteerCollection.find({email: queryEmail}).toArray()
            .then(result => {
                console.log(result);
                res.send(result);
            })
        })


        //POST

        app.post(`/registeredVolunteer`, async (req, res) => {
            registeredVolunteerCollection.insertOne(req.body).then(result => {
                res.send(result);
            })
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