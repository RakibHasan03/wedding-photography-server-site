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
        const reviewCollection= client.db('weedingPHghy').collection('reviews');

        //services Api
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = photographyCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log(service)
            const result = await photographyCollection.insertOne(service);
            res.send(result)
        });

        app.get('/service', async (req, res) => {
            const query = {}
            const service = photographyCollection.find(query).sort({ _id: -1 });
            const result = await service.limit(3).toArray()
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await photographyCollection.findOne(query);
            res.send(service);
        });


        //Review Api
 

        app.get("/reviews", async (req, res) => {
            const name = req.query.serviceName;
            const query = { serviceName: name };
            const result = await reviewCollection.find(query).sort({ _id: -1 }).toArray();
            res.send(result);
            
        });
        
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        });
        app.get('/myReview', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email }
            const result = await reviewCollection.find(query).sort({ _id: -1 }).toArray();
            res.send(result);

        });
        app.get("/myReview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        //delete method
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        //update method
        app.put('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review= req.body;
            const option = { upsert: true };
            const updateReview= {
                $set: {
                    message: review.message,
                    rating: review.rating
                   
                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option);
            res.send(result);
        })
    
    }
    finally {
        
    }
}

run().catch(err => console.error(err));





app.get('/', (req, res) => {
    res.send('activities-review server is running')
})
app.listen(port, () => {
    console.log(`activities-review server running on ${port} `)
})