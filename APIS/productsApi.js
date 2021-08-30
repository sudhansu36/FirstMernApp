const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const productApiObj = express.Router();
const { multerObj } = require("./middlewares/cloudinary");
const checkToken = require("./middlewares/verifyToken");
productApiObj.use(express.json());
productApiObj.use((req, res, next) => {
  productCollection = req.app.get("productCollection");
  next();
});
let productCollection;
productApiObj.post(
  "/addproduct",
  checkToken,
  multerObj.single("photo"),
  expressAsyncHandler(async (req, res) => {
    // get product obj
    let productObj = JSON.parse(req.body.productObj);
    let UniqueProduct = await productCollection.findOne({
      pid: productObj.pid,
    });
    if (UniqueProduct === undefined) {
      //add image cdn link to productObj
      productObj.image = req.file.path;
      await productCollection.insertOne(productObj);
      // send res
      res.send({ message: "New Product Created" });
    } else {
      res.send({ message: "Product Id Already exist" });
    }
  })
);

// get Products
productApiObj.get(
  "/getproducts",
  checkToken,
  expressAsyncHandler(async (req, res) => {
    let product = await productCollection.find().toArray();
    res.send({ message: "success", payload: product });
  })
);
module.exports = productApiObj;
