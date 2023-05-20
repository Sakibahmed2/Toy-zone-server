const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()


const port = process.env.PORT || 5000;
const app = express();

// middleware 
app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zq9ay5k.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db('toyCollection').collection('toys')

    app.get('/', (req, res) => {
      res.send('Toy zone is running')
    })

    app.get('/toys', async (req, res) => {
      const limit = parseInt(req.query.limit)
      const result = await toysCollection.find().limit(limit).toArray();
      res.send(result)
    })

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const option = {
        projection: { _id: 1, toys: 1, image_link: 1, toy_name: 1, quantity: 1, seller_name: 1, seller_email: 1, category: 1, price: 1, rating: 1, description: 1 },
      }
      const result = await toysCollection.findOne(query, option)
      res.send(result)
    })



    app.get('/category/:categoris', async (req, res) => {
      if (req.params.categoris == "spider man" || req.params.categoris == "Iron Man" || req.params.categoris == "hulk") {
        const result = await toysCollection.find({ category: req.params.categoris }).toArray()
        return res.send(result)
      }
    })


    app.get('/mytoys/:email', async (req, res) => {
      const myToy = await toysCollection.find({
        seller_email: req.params.email,
      }).sort({price: 1}).toArray()
      res.send(myToy)
    })


    app.get('/searchToyName/:name', async (req, res) => {
      const toyName = req.params.name;
      const result = await toysCollection.find({

        toy_name: { $regex: toyName, $options: 'i' }

      }).toArray();
      res.send(result)
    })


    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy)
      res.send(result)
    })


    app.delete('/deleteToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })



    app.put('/updateToys/:id', async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: updatedToy.quantity,
          price: updatedToy.price,
          description: updatedToy.description
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
run().catch(console.dir);






app.listen(port, () => {
  console.log(`Assignment server is running on : ${port}`);
})