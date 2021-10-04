const express = require("express");
const expressAsyncHandler = require("express-async-handler");
// const checkToken = require("./middlewares/verifyToken");
const cartApiObj = express.Router();
cartApiObj.use(express.json());
let cartCollection;
cartApiObj.use((req, res, next) => {
  cartCollection = req.app.get("cartCollection");
  next();
});
cartApiObj.post(
  "/addtocart",
  expressAsyncHandler(async (req, res) => {
    let { username, product } = req.body;
    let newCart = JSON.parse(JSON.stringify(product));
    let oldCart = await cartCollection.findOne({ username: username });
    if (oldCart === undefined) {
      newCart.count = 1;
      await cartCollection.insertOne({
        username: username,
        cart: [{ ...newCart }],
      });
      let updatedCart = await cartCollection.findOne({ username: username });
      res.send({ message: "success", payload: updatedCart });
    } else {
      let result = oldCart.cart.find(({ pid }) => pid === newCart.pid);
      if (result === undefined) {
        newCart.count = 1;
        await cartCollection.updateOne(
          { username: username },
          { $addToSet: { cart: newCart } }
        );
        let updatedCart = await cartCollection.findOne({ username: username });
        res.send({ message: "success", payload: updatedCart });
      } else {
        count = result.count + 1;
        await cartCollection.updateOne(
          { username: username, "cart.pid": newCart.pid },
          { $set: { "cart.$.count": count } }
        );
        let updatedCart = await cartCollection.findOne({ username: username });
        res.send({ message: "success", payload: updatedCart });
      }
    }
  })
);
cartApiObj.get(
  "/getcart/:username",
  expressAsyncHandler(async (req, res) => {
    let username = req.params.username;
    let oldCart = await cartCollection.findOne({ username: username });
    if (oldCart!== undefined) {
      res.send({ message: "success", payload: oldCart.cart });
    } else {
      res.send({ message: "success", payload: [] });
    }
  })
);
cartApiObj.put(
  "/deletecart/:username",
  expressAsyncHandler(async (req, res) => {
    let username = req.params.username;
    let product = req.body;
    let newCart = JSON.parse(JSON.stringify(product));
    let oldCart = await cartCollection.findOne({ username: username });
    let result = oldCart.cart.find(({ pid }) => pid === newCart.pid);
    if (result.count === 1) {
      await cartCollection.updateOne(
        { username: username },
        { $pull: { cart: { pid: newCart.pid } } }
      );
      let updatedCart = await cartCollection.findOne({ username: username });
      res.send({ message: "success", payload: updatedCart });
    } else {
      count = result.count - 1;
      await cartCollection.updateOne(
        { username: username, "cart.pid": newCart.pid },
        { $set: { "cart.$.count": count } }
      );
      let updatedCart = await cartCollection.findOne({ username: username });
      res.send({ message: "success", payload: updatedCart });
    }
  })
);

module.exports = cartApiObj;
