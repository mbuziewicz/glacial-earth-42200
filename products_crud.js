import express from "express";
import Product from "../schema/products"
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res, next) => {
    res.status(200).json({
        message:"Serving Products on the Endpoint."
    });   
});

router.get("/list", (req, res, next) => {
    Product.find({})
        .exec()
        .then(docs => {
            /////res.status(200).json({
            /////    docs
            /////});
            res.render('product_view',{
                results: docs
              });
        })
        .catch(err => {
            console.log(err)
        });
});

router.post("/add", (req, res, next) => {

    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        imagePath: req.body.imagePath,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price 
    });

    product.save()
    .then(result => {
        ///res.status(200).json({
        ///    docs:[product],
        ///});
        res.redirect('/products/list');

    })
    .catch(err => {
        console.log(err);
    });
});


  //route for update data
  router.post('/update',(req, res) => {
      let product = {};  //create empty object for product updates
      product.imagePath = req.body.imagePath;
      product.title = req.body.title;
    const rid = req.body.product_id;
    let query = {_id: rid}
    console.log(query)

    // Find note and update it with the request body
    Product.updateOne(query, product, function(err) {
        if (err){
            console.log(err);
            return;
        }else{
        res.redirect('/products/list');
        }
        });
    
  });


router.post("/delete", (req, res, next) => {
    const rid = req.body.product_id2;
    console.log(rid)
    
    Product.findById(rid)
        .exec()
        .then(docs => {
            docs.remove();
            ////res.status(200).json({
            ////    deleted:true
            ////});
            res.redirect('/products/list');
        })
        .catch(err => {
            console.log(err)
        });
});

module.exports = router;