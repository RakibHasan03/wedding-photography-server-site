const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('activities-review server is running')
})
app.listen(port, () => {
    console.log(`activities-review server running on ${port} `)
})