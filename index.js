const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middlewere 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wueeg5w.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const benefitedCollection = client.db('planPilotDB').collection('benefited');
    const userCollection = client.db('planPilotDB').collection('users');
    const taskCollection = client.db('planPilotDB').collection('task');

    // benefited collection 
    app.get('/benefited', async (req, res) => {
      const result = await benefitedCollection.find().toArray()
      res.send(result)
    })


    app.post('/users', async (req, res) => {
      const user = req.body;

      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.get('/user', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result =await userCollection.findOne(query)
      res.send(result)
    })

    // task collection
    app.post('/task', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result)
    })

    app.get('/task', async (req, res) => {
      const email = req.query.email
      const query = { userEmail: email }
      // console.log(email);
      const result = await taskCollection.find(query).toArray()
      res.send(result)
    })

    app.delete('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.findOne(query)
      res.send(result)
    })


    app.put('/task/:id', async (req, res) => {
      const id = req.params.id;
      const updateTask = req.body;
      // console.log(updateTask);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = {
        $set: {
          task: updateTask.task,
          description: updateTask.description,
          deadline: updateTask.deadline,
          priority: updateTask.priority
        }
      }
      const result = await taskCollection.updateOne(filter, update, options)
      res.send(result)
    })

    app.patch('/task/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const update = {
        $set: {
          complite: true
        }
      }
      const result = await taskCollection.updateOne(filter, update, options)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is runing from ${port}`)
})