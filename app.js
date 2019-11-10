
// Setup
var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect("mongodb://dbuser:dbpassword1@ds233288.mlab.com:33288/heroku_hpvbn9qq",{ useNewUrlParser: true })

var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session  = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
//exports a MongoStore to use.  Set up the session.
var MongoStore = require('connect-mongo')(session);


//var Cart = require('cart');
var Cart = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function (item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

    this.reduceByOne = function (id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if(this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    this.removeItem = function (id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    this.generateArray = function () {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};

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



//configure the session
//add a new MongoStore.  Connect to the existing connection
//Set the timeout of the session cookie 180 minutes, 60 seconds, //1000 milliseconds  (*Remove after 3 hours*)
app.use(session({
   secret: 'mysecret',
   resave: false,
   saveUninitialized: false,
   store: new MongoStore({ mongooseConnection: mongoose.connection }),
   cookie: {maxAge: 180 * 60 * 1000}
}));


//make sure that I can access the session without importing it each time.
app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
  });
  
  app.get('/add-to-cart/:id', function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function (err, product) {
        if(err) {
            return res.redirect('/products');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/products');
    })
});


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


app.post("/products_crud/add", (req, res, next) => {

    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        img: req.body.img,
        description: req.body.description,
        price: req.body.price 
    });

    product.save()
    .then(result => {
        ///res.status(200).json({
        ///    docs:[product],
        ///});
        res.redirect('/products_crud');

    })
    .catch(err => {
        console.log(err);
    });
});


  //route for update data
 app.post('/products_crud/update',(req, res) => {
      let product = {};  //create empty object for product updates
      product.name = req.body.name;
      product.img = req.body.img;
      product.price = req.body.price;
      product.description = req.body.description;
    const rid = req.body.product_id;
    let query = {_id: rid}
    console.log(query)

    // Find note and update it with the request body
    Product.updateOne(query, product, function(err) {
        if (err){
            console.log(err);
            return;
        }else{
            res.redirect('/products_crud');
        }
        });
    
  });


app.post("/products_crud/delete", (req, res, next) => {
    const rid = req.body.product_id2;
    console.log(rid)
    
    Product.findById(rid)
        .exec()
        .then(docs => {
            docs.remove();
            ////res.status(200).json({
            ////    deleted:true
            ////});
            res.redirect('/products_crud');
        })
        .catch(err => {
            console.log(err)
        });
});


/*  Add post from first page.  This needs to go */
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

/*
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
*/


 var PORT = 5000;
 // Listen
app.listen(process.env.PORT || PORT, () => {
    console.log('Server listing on ' + PORT);
})


