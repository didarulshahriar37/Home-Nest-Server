const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.spgu1hn.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/", (req, res) => {
  res.send('HomeNest server is running');
})

async function run() {
  try {
    await client.connect();

    const db = client.db("homeNest_db");
    const usersCollection = db.collection("users");
    const agentsCollection = db.collection("agents");
    const propertiesCollection = db.collection("properties");
    const reviewsCollection = db.collection("reviews");

    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    })

    app.get("/reviews", async (req, res) => {

      const query = {};
      if (req.query.email) {
        query["postedBy.email"] = req.query.email;
      }
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.patch("/all-properties/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInfo = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedInfo
      }
      const result = await propertiesCollection.updateOne(query, update);
      res.send(result);
    })

    app.post("/all-properties", async (req, res) => {
      const newProperty = req.body;
      const result = await propertiesCollection.insertOne(newProperty);
      res.send(result);
    })

    app.get("/all-properties", async (req, res) => {

      const query = {};
      if (req.query.email) {
        query["postedBy.email"] = req.query.email;
      }
      const cursor = propertiesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete("/all-properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.deleteOne(query);
      res.send(result);
    })

    app.get("/featured-properties", async (req, res) => {
      const cursor = propertiesCollection.find().sort({ postedDate: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/agents", async (req, res) => {
      const cursor = agentsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: 'User already Exists.' })
      }
      else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    })

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {

  }
}
run().catch(console.dir)

app.listen(port, () => {
  console.log(`HomeNest server is running on port : ${port}`)
})