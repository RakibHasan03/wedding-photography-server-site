const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());

//mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h32cfqq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log(uri)
async function run() {
    try {
        const photographyCollection = client.db('weedingPHghy').collection('services');
        
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = photographyCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
    }
    catch {
        
    }
}

run().catch(err => console.error(err));





app.get('/', (req, res) => {
    res.send('activities-review server is running')
})
app.listen(port, () => {
    console.log(`activities-review server running on ${port} `)
})