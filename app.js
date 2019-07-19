var express    = require("express"),
    app        = express(),
    mongoose   = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require('method-override'),
    expressSanitizer = require("express-sanitizer")

//APP CONFIG
app.use(methodOverride('_method'))
app.set("view engine","ejs")
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressSanitizer())                                            //should be after body-parser
mongoose.connect("mongodb://localhost/blog_app",{useNewUrlParser:true});
mongoose.set('useFindAndModify', false);                                     //To remove the warning---->>  DeprecationWarning: collection.findAndModify is deprecated. Use findOneAndUpdate, findOneAndReplace or findOneAndDelete instead.

//MONGOOSE / MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body : String,
    created : {type : Date, default : Date.now}
})
var Blog = mongoose.model("Blog", blogSchema);

//ROUTES

app.get("/blogs", function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR");
            console.log(err);
        }else{
            res.render("index",{blogs : blogs});
        }
    })
})

app.get("/blogs/new",function(req,res){
    res.render("new");
})

app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id,function(err,blog){
        if(err){
            console.log(err);
        }else{
            res.render("show",{blog:blog})
        }
    })
})

app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,blog){
        if(err){
            console.log(err);
        }else{
            res.render("edit",{blog:blog});
        }
    })
})

app.post("/blogs",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err,blog){
        if(err){
            console.log(err);
        }else{
            res.redirect("/blogs");
        }
    })
})

app.put("/blogs/:id",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
     Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
         if(err){
             res.redirect("/blogs");
         }else{
             res.redirect("/blogs/"+updatedBlog._id)
         }
     })
})

app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/blogs");
        }
    })
})

app.listen(3000, function(){
    console.log("Blog Server Has Started!!");
})