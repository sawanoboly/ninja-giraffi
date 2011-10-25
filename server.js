
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer(),
    giraffi = require('giraffi'),
    giraffi_client = require('giraffi').createClient(),
    mongoose = require('mongoose');

// Create a connection to your MongoDB by default port
mongoose.connect('mongodb://localhost/test_ninja');

// Create a new scheme objects
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var BlogPost = new Schema({
  author: ObjectId,
  title: String,
  body: String,
  date: Date
});

var blogPost = mongoose.model('BlogPost', BlogPost);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // Set up giraffi logger
  app.use(giraffi.expressLogger(giraffi_client));

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  // set giraffi errorHandler
  app.use(giraffi.errorHandler(giraffi_client));
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'Expresssss'
  });
});

app.get('/error', function(req, res) {
  // Send error statck trace to giraffi
  a.b.c();
  res.render('index', {
    title: 'Error Test'
  });
});

app.get('/blogs/new', function(req, res) {
  res.render('blog', {
    title: "Blog"
  });
});

app.get('/blogs', function(req, res) {
  blogPost.find({}, function(err, docs) {
    res.render('blog_index', {
      title: "Posted Blogs",
      blogs: docs
    });
  });
});

app.post('/blogs', function(req, res) {
  if (req.body.blog) {
    // Send info level log to giraffi
    giraffi_client.level("info").logger("save to model:" + req.body.blog.title);
    
    var blog = new blogPost();
    blog.title = req.body.blog.title;
    blog.body = req.body.blog.body;
    blog.save();
  }
  
  res.redirect('/blogs');
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
