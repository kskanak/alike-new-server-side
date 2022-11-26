require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

// middle ware
app.use(cors());
app.use(express.json());

// mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lnnhqxo.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const catagoryItemsCollection = client
    .db("alikeNew")
    .collection("catagoryItems");
  const userCollection = client.db("alikeNew").collection("users");
  const bookingCollection = client.db("alikeNew").collection("bookings");

  try {
    app.get("/catagoryItems/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const query = {
        catagory_id: id,
      };
      const result = await catagoryItemsCollection.find(query).toArray();
      res.send(result);
    });

    // user api
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };

      const existedUser = await userCollection.findOne(query);
      if (existedUser) {
        res.send({ acknowledged: "existed" });
        return;
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // item booking api
    app.post("/bookings", async (req, res) => {
      const item = req.body;
      const result = await bookingCollection.insertOne(item);
      res.send(result);
    });

    // all seller api

    app.get("/allseller", async (req, res) => {
      const query = { userRole: "seller" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // all buyer api
    app.get("/allbuyer", async (req, res) => {
      const query = { userRole: "buyer" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch((error) => console.log(error.message));
// mongo db

app.get("/", (req, res) => {
  res.send("server okk");
});

app.listen(port, () => {
  console.log("running on", port);
});
