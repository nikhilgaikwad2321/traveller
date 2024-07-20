if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
//express router
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
//express-sesison
const session=require("express-session");
const MongoStore = require('connect-mongo');
//using flash
const flash=require("connect-flash");
//authentication
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const dbUrl=process.env.ATLASDB_URL;

async function main(){
    await mongoose.connect(dbUrl);
}
main()
    .then(()=>{
        console.log("connected to database");
    })
    .catch(()=>{
        console.log(err);
    });

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));//to include static files(css)
//session
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{ 
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,//session information remains stored (no changes)
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("hi  I am your root");
// });

app.use(session(sessionOptions));
app.use(flash());

//authentication
app.use(passport.initialize());//session should be implemented for using passport
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//storing the information
passport.deserializeUser(User.deserializeUser());//removing the user after session is over

//flash middleware
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    //merging login logout and signup
    res.locals.currUser=req.user;
    next();  //to show the flash message we use the local variable in index.ejs
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);//if we want to merge oarent route to child we use mergeparams
app.use("/",userRouter);

//if user send request to random url which doesnt match to all then it matches to
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
//error handling middleware at last
app.use((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || "something is wrong";
    res.render("listings/error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});