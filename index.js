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

  app.get("/catagoryItems/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const query = {
      catagory_id: id,
    };
    const result = await catagoryItemsCollection.find(query).toArray();
    res.send(result);
  });

  try {
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
