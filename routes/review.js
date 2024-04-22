const express=require("express");
const router=express.Router({mergeParams:true});//cannot read properties of null so define options in router
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/WrapAsync.js");
const Review=require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController=require("../controllers/review.js");

//review 
//post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports=router;
