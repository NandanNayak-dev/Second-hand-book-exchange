const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review");
const booklist = require("../models/booklist");

//=============REVIEWS===========================
router.post("/",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findById(id);
    const review=new Review(req.body.review);
    book.reviews.push(review._id);
    await review.save();
    await book.save();
    req.flash("success","Review Added Successfully");
    res.redirect(`/booklistings/${book._id}`);
}))
//====Delete Review=====
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    const {id,reviewId}=req.params;
    await booklist.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted Successfully");
    res.redirect(`/booklistings/${id}`);
}))
module.exports=router;