// create mini express app
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userDpObj } = require("./middlewares/cloudinary");
const userApiObj = express.Router();
// body parser middleware
userApiObj.use(express.json());
// get userCollectionObject
userApiObj.use((req, res, next) => {
  userCollection = req.app.get("userCollection");
  next();
});
// User registration
userApiObj.post(
  "/register",
  userDpObj.single("photo"),
  expressAsyncHandler(async (req, res) => {
    // get user from req.body
    let newUser = JSON.parse(req.body.userObj);
    newUser.image = req.file.path;
    // check for duplicate user
    let user = await userCollection.findOne({ username: newUser.username });
    // if user existed , send response as "user existed"
    if (user !== undefined) {
      res.send({ message: "User Already Existed" });
    } else {
      // hash pw
      let hashedPassword = await bcryptjs.hash(newUser.password, 6);
      // replace plain pw with hash pw
      newUser.password = hashedPassword;
      // insert userObj to userCollection
      await userCollection.insertOne(newUser);
      // send res
      res.send({ message: "User Registered Successfully" });
    }
  })
);
// Login
userApiObj.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    // get user credentials obj
    let userCredentialObj = req.body;
    // find user by user name
    let user = await userCollection.findOne({
      username: userCredentialObj.username,
    });
    // if user is not there
    if (user === undefined) {
      res.send({ message: "Invalid Username" });
    }
    // user found
    else {
      // compare password
      let status = await bcryptjs.compare(
        userCredentialObj.password,
        user.password
      );
      // if Password not Matched
      if (status === false) {
        res.send({ message: "Invalid Password" });
      }
      // password matched
      else {
        // create and send token
        let signedToken = await jwt.sign(
          { username: user.username },
          process.env.SECRET,
          { expiresIn: "1d" }
        );
        // send token in res
        res.send({ message: "success", token: signedToken, user: user });
      }
    }
  })
);
// export
module.exports = userApiObj;
