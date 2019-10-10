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

var productSchema = new mongoose.Schema({ body: String });
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
         res.status(400).send("Unable to save data");
     });
 });
 
 
 app.get("/products", (req, res) => {
    Product.find({}, (err, products) => {
       res.render('products/index', { products: products})
    });
 });
 app.post('/addproduct', (req, res) => {
     var productData = new Product(req.body);
     productData.save().then( result => {
         res.redirect('/products');
     }).catch(err => {
         res.status(400).send("Unable to save data");
     });
 });

 
 // Listen
app.listen(process.env.PORT || 5000, () => {
    console.log('Server listing on 3000');
})