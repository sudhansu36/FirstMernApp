// create express app
const express = require("express");
const app = express();

// configure dotenv
// the config() provides all env variables in process.env
require("dotenv").config();
// import path module
const path = require("path");
app.use(express.static(path.join(__dirname, "./client/build")));
// connect build of react app with express
// import APIS objects
const userApiObj = require("./APIS/userApi");
const adminApiObj = require("./APIS/adminApi");
const cartApiObj = require("./APIS/cartApi");
const productApiObj = require("./APIS/productsApi");


// use userApiObj when path starts with /users
app.use("/users", userApiObj);
app.use("/admin", adminApiObj);
app.use("/carts", cartApiObj);

app.use("/products", productApiObj);
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

// import mongodb module
const mongoClient = require("mongodb").MongoClient;
// get database Url
const dbUrl = process.env.DATABASE_URL;
// connect
mongoClient.connect(dbUrl, (err, client) => {
  if (err) {
    console.log("err in db connect", err);
  } else {
    // get obj of database
    let databaseObject = client.db("merndb");
    // get object of collections
    let userCollection = databaseObject.collection("usercollection");
    let adminCollection = databaseObject.collection("admincollection");
    let productCollection = databaseObject.collection("productcollection");
    let cartCollection = databaseObject.collection("cartcollection");
    // set to app Object
    app.set("userCollection", userCollection);
    app.set("adminCollection", adminCollection);
    app.set("productCollection", productCollection);
    app.set("cartCollection", cartCollection);
    console.log("Connected to DB");
  }
});

// if path not available
app.use((req, res, next) => {
  res.send({ message: `Path ${req.url} not Available` });
});

// error handler
app.use((err, req, res, next) => {
  res.send({ message: "Error Occured", reason: err.message });
});

// assign port
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
