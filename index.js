const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

function verifyJWT(req, res, next) {
  const AuthHeader = req.headers.authorization;

  if (!AuthHeader) {
    return res.status(401).send({ message: "UnAuthorized accessed" });
  }
  const token = AuthHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRCT_KEY, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const catagoryItemsCollection = client
      .db("alikeNew")
      .collection("catagoryItems");
    const userCollection = client.db("alikeNew").collection("users");
    const bookingCollection = client.db("alikeNew").collection("bookings");
    const advertiseCollection = client.db("alikeNew").collection("advertise");

    // verify admin token after jwttoken

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);
      if (user?.userRole !== "admin") {
        res.status(403).send({ message: "forbidden" });
      }
      next();
    };

    app.get("/catagoryItemss/:catagory", async (req, res) => {
      const catagory = req.params.catagory;
      const query = {
        catagory: catagory,
      };
      const result = await catagoryItemsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/catagoryProduct", async (req, res) => {
      const product = req.body;
      const result = await catagoryItemsCollection.insertOne(product);
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

    // item advertise post api
    app.post("/advertise", async (req, res) => {
      const item = req.body;
      const result = await advertiseCollection.insertOne(item);
      res.send(result);
    });
    // item advertise get api

    app.get("/advertise", verifyJWT, async (req, res) => {
      const query = {};

      const result = await advertiseCollection.find(query).toArray();
      res.send(result);
    });

    // all seller api

    app.get("/allseller", async (req, res) => {
      const query = { userRole: "seller" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/allseller/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // all seller product api

    app.get("/sellerProducts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await catagoryItemsCollection.find(query).toArray();
      res.send(result);
    });

    // single seller api
    app.get("/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // delete Seller products
    app.delete("/deleteSellerProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await catagoryItemsCollection.deleteOne(query);
      res.send(result);
    });

    // seller verify api

    app.put("/verifyseller/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedoc = {
        $set: {
          status: "verified",
        },
      };
      const result = await userCollection.updateOne(filter, updatedoc, options);
      res.send(result);
    });

    // all buyer api
    app.get("/allbuyer", verifyJWT, async (req, res) => {
      const query = { userRole: "buyer" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/allbuyer/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // admin  api

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      return res.send({ isAdmin: user?.userRole === "admin" });
    });

    // user role
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      return res.send({ role: user?.userRole });
    });

    // sellers all product api

    app.get("/myorders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    //  jwt
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user && user?.email) {
        const token = jwt.sign({ email }, process.env.SECRCT_KEY, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      return res.status(401).send({ accessToken: "" });
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
