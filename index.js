const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 3000;

var corsOptions = {
  origin: ["http://localhost:5173/", "http://localhost:5174/"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

// middleware start #################################################################
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};
// middleware end ***************************************************************

// mongoDB start #################################################################
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sp25joa.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // jwt token create
    app.post("/jwt", async (req, res) => {
      const email = req.body.email;
      const token = jwt.sign(email, process.env.JWT_SECRET_TOKEN, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token)
        .send({ message: "successfully created token " });
    });

    // remove jwt token from browser cookies
    app.post("/logout", async (req, res) => {
      res.clearCookie("token").send({ message: "Logged out successfully" });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongoDB end ***************************************************************

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
