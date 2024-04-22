const express=require("express");
const router=express.Router({mergeParams:true});//cannot read properties of null so define options in router
const User=require("../models/user.js");
const wrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController= require("../controllers/user.js");

router.get("/signup",userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

router.get("/login",userController.renderLoginForm);

router.post("/login",saveRedirectUrl,
    passport.authenticate("local",{ 
    failureRedirect:"/login", 
    failureFlash:true
    }),
    userController.login
);

router.get("/logout",userController.logout);

module.exports=router;