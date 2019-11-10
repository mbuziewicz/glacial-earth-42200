
// Setup
var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect("mongodb://dbuser:dbpassword1@ds233288.mlab.com:33288/heroku_hpvbn9qq",{ useNewUrlParser: true })

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

var postSchema = new mongoose.Schema({ body: String });
var Post = mongoose.model('Post', postSchema);

var productSchema = new mongoose.Schema({ name: String, description: String, price: {type: Number, min: 1, required: [true,'Please enter price']}, qty: Number, img: String });
var Product = mongoose.model('Product', productSchema);


//import products from "./routes/products"
//var products = "./routes/products"
//app.use("/products", products);


// Routes
app.get("/", (req, res) => {
    Post.find({}, (err, posts) => {
       res.render('index', { posts: posts})
    });
 });

// app.get("/products_crud", (req, res) => {
 //   res.redirect('products_crud/');
//});

app.get("/products_crud", (req, res, next) => {
    Product.find({})
        .exec()
        .then(docs => {
            /////res.status(200).json({
            /////    docs
            /////});
            res.render('products_crud/index',{
                products: docs
              });
        })
        .catch(err => {
            console.log(err)
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
else{
  Product.find({}, function(err, allProducts){
       if(err){
           console.log(err);
       } else {
          res.render("products/index",{products:allProducts});
       }
    });

}
});

 
 
 app.get("/cart", (req, res) => {
    Product.find({}, (err, products) => {
       res.render('cart/cart', { products: products})
    });
    console.log(req.query.search)
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


