const express = require('express');
const PORT = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase-admin/app');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzsam.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



//Admin
const admin = require("firebase-admin");

const serviceAccount = require("./configs/volunteer-network-6351d-firebase-adminsdk-is1pp-175640f9c8.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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
            const bearer = req.headers.authorization;
            if (bearer && bearer.startsWith('Bearer ')) {
                const idToken = bearer.split(' ')[1];
                admin.auth()
                    .verifyIdToken(idToken)
                    .then((decodedToken) => {
                        const tokenEmail = decodedToken.email;
                        const queryEmail = req.query.email;
                        if (tokenEmail === queryEmail) {
                            registeredVolunteerCollection.find({ email: queryEmail }).toArray()
                                .then(result => {
                                    res.send(result);
                                })
                        }
                        else {
                            res.status(401).send('Un-authorized access!')

                        }
                    })
                    .catch((error) => {
                        res.status(401).send('Un-authorized access!')
                    });
            }
            else {
                res.status(401).send('Un-authorized access!')
            }
        })


        app.get('/collectionItem', async (req, res) => {
            const params = req.query.id;
            allDataCollection.find({ id: parseInt(params) }).toArray().then(result => {
                res.send(result)
            })
        })

        app.get('/getItem/:id', async (req, res) => {
            const reqId = req.params.id;
            allDataCollection.find({ id: parseInt(reqId) }).toArray().then(result => {
                res.send(result);
            })
        })

        app.get('/adminCollection', async (req, res) => {
            registeredVolunteerCollection.find({}).toArray().then(result => {
                res.status(200).send(result);
            })
        })


        app.get('/newVolunteerListId', async (req, res) => {
            allDataCollection.find({}).toArray().then(result => {
                res.send(result);
            })
        })

        //POST
        app.post(`/registeredVolunteer`, async (req, res) => {
            registeredVolunteerCollection.insertOne(req.body).then(result => {
                res.send(result);
            })
        })


        app.post('/addNewVolunteerNetwork', async (req, res) => {
            const addVolunteerNetwork = req.body;
            allDataCollection.insertOne(addVolunteerNetwork).then(result => {
                res.send(result.acknowledged === true);
            })
        })


        //DELETE
        app.delete('/deleteVolunteer', async (req, res) => {
            const itemId = req.body.itemId;
            const loggedUserEmail = req.body.email;
            const findDeleteItem = registeredVolunteerCollection.find({ email: loggedUserEmail }).toArray().then(result => {
                const findDeleteItemId = result.find(item => parseInt(item.id) === itemId);
                registeredVolunteerCollection.deleteOne(findDeleteItemId).then(result => {
                    res.send(result.deletedCount > 0)
                })
            })
        })

        app.delete('/deleteListByAdmin/:id', async (req, res) => {
            const id = req.params.id;
            const findDeleteItem = registeredVolunteerCollection.find({ _id: new ObjectId(id) }).toArray().then(deleteItem => {
                registeredVolunteerCollection.deleteOne(deleteItem[0]).then(result => {
                    res.send(result.deletedCount > 0)
                })
            })
        })




        app.listen(PORT, console.log('server is running'));
    } catch (err) {
        console.log(err);
    }
}

run();