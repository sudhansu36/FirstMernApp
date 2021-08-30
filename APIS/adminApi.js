const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const adminApiObj = express.Router();
adminApiObj.use(express.json());
adminApiObj.use((req, res, next) => {
  adminCollection = req.app.get("adminCollection");
  next();
});
// Login
adminApiObj.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    // get user credentials obj
    let adminCredentialObj = req.body;
    // find user by user name
    let admin = await adminCollection.findOne({
      username: adminCredentialObj.username,
    });
    // if user is not there
    if (admin === undefined) {
      res.send({ message: "Invalid Username" });
    }
    // user found
    else {
      // compare password
      let status = admin.password === adminCredentialObj.password;
      // if Password not Matched
      if (status === false) {
        res.send({ message: "Invalid Password" });
      }
      // password matched
      else {
        // create and send token
        let signedToken = await jwt.sign(
          { username: admin.username },
          process.env.SECRET,
          { expiresIn: 6000 }
        );
        // send token in res
        res.send({ message: "success", token: signedToken, user: admin });
      }
    }
  })
);

module.exports = adminApiObj;
