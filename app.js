//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();



//========================================= Middleware ================================================//
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended:true
}));

// Setting up Session
app.use(session({
    secret : "Our big daddy is your grandfather",
    resave : false,
    saveUninitialized : false
}));

// Initialising Passport
app.use(passport.initialize());

// Initialising passport to setup sessions
app.use(passport.session());
 
// Connecting Database

mongoose.connect("mongodb://localhost:27017/userDB",{
    useNewUrlParser:true,  
    useUnifiedTopology: true
 });

 mongoose.set("useCreateIndex", true)

// User Schema

const userSchema =new mongoose.Schema( {
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());
// Serializing/Deserializing
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//========================================= Routes ================================================//


app.get("/", (req,res)=>{
    res.render('home');
});

app.get("/login", (req,res)=>{
    res.render('login');
});

app.get("/register", (req,res)=>{
    res.render('register');
});

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/");
});

app.post("/register", (req,res)=>{
    User.register({username : req.body.username}, req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/redirect");
        }else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            });
        }
    });
    
});

app.post("/login", (req,res)=>{
    const user = new User({
        username: req.body.username,
        password : req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            });
        }
    });

});

//========================================= Server ================================================//
app.listen('6900', ()=>{
    console.log("App started at PORT 6900");
});


