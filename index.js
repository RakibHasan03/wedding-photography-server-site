const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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


//jwt middle ware

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}


// console.log(uri)
async function run() {
    try {

        const usersCollection = client.db('weedingPHghy').collection('users');
        const photographyCollection = client.db('weedingPHghy').collection('services');
        const reviewCollection = client.db('weedingPHghy').collection('reviews');
        const bookingCollection = client.db('weedingPHghy').collection('bookings');
        
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })  

        //services Api
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = photographyCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // user
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        //admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' });
        });

        //service

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
        app.get('/myReview', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
              return  res.status(403).send({ message: 'unauthorized access' })
            }
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

        // get booking
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        });
        //post booking 
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);


            const query = {
                productId: booking.productId,
                email: booking.email

            }

            const alreadyBooked = await bookingCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking for ${booking.ProductTitle}`
                return res.send({ acknowledged: false, message })
            }


            const result = await bookingCollection.insertOne(booking);
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