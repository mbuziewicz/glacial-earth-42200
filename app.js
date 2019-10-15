// Setup
var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect("mongodb://dbuser:dbpassword1@ds233288.mlab.com:33288/heroku_hpvbn9qq");

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var postSchema = new mongoose.Schema({ body: String });
var Post = mongoose.model('Post', postSchema);

var productSchema = new mongoose.Schema({ name: String, description: String, price: {type: Number, min: 1, required: [true,'Please enter price']}, qty: Number, img: String });
var Product = mongoose.model('Product', productSchema);


// Routes
app.get("/", (req, res) => {
    Post.find({}, (err, posts) => {
       res.render('index', { posts: posts})
    });
 });

 app.post('/addpost', (req, res) => {
     var postData = new Post(req.body);
     postData.save().then( result => {
         res.redirect('/');
     }).catch(err => {
         res.status(400).send("Something went wrong. Unable to save data");
     });
 });
 

/*
app.get("/", function(req, res) {
    if (req.query.search) {
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       Jobs.find({ name: regex }, function(err, foundjobs) {
           if(err) {
               console.log(err);
           } else {
              res.render("jobs/index", { jobs: foundjobs });
           }
       }); 
    }
}
*/

app.get("/products", function(req, res){
    if (req.query.search) {
       Product.find({ name: req.query.search}, function(err, foundproducts){
       if(err){
           console.log(err);
       } else {
            res.render("products/index",{products:foundproducts});
       }
    }); 
    }

  Product.find({}, function(err, allProducts){
       if(err){
           console.log(err);
       } else {
          res.render("products/index",{products:allProducts});
       }
    });
});
 

 /*
 app.get("/products", (req, res) => {
    Product.find({}, (err, products) => {
       res.render('products/index', { products: products})
    });
    console.log(req.query.search)
 });
 */


 app.get("/product_add", (req, res) => {
    Product.find({}, (err, products) => {
        res.render('products/product_add', { products: products})
    });
 });
 
 app.post('/addproduct', (req, res) => {
     var productData = new Product(req.body);
     productData.save().then( result => {
        Product.find({}, (err, products) => {
            res.render('products/product_add', { products: products})
        });
    }).catch(err => {
         res.status(400).send("Unable to save data");
         console.log(err);
     });
 });

 var PORT = 5000;
 // Listen
app.listen(process.env.PORT || PORT, () => {
    console.log('Server listing on ' + PORT);
})


