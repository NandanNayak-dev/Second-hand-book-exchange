const express=require('express');
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync');  
const booklist=require('../models/booklist');

router.get("/",async(req,res)=>{
    const books=await booklist.find({});
    res.render("booklistings/index",{books});
})
//===============================
//New Book Route=====
router.get("/new",async(req,res)=>{
    res.render("booklistings/new");
})
//Create Book Route=====
router.post("/",wrapAsync(async(req,res)=>{
    const book=new booklist(req.body.booklisting);
    await book.save();
    req.flash("success","Book Added Successfully");
    res.redirect(`/booklistings/${book._id}`);
}))
//==========================================

//==========Get Edit route============
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const bookToEdit=await booklist.findById(id);
    res.render("booklistings/edit",{bookToEdit});
}))
//=====Update route=========
router.put("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findByIdAndUpdate(id,req.body.booklisting,{new:true});
    req.flash("success","Book Updated Successfully");
    res.redirect(`/booklistings/${book._id}`);

}))

//======Delete route==========
router.delete("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findById(id);
    await Review.deleteMany({ _id: { $in: book.reviews } });
    await booklist.findByIdAndDelete(id);
    req.flash("success","Book Deleted Successfully");
    res.redirect("/booklistings");
}))

//Show Particular Book=====
router.get("/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findById(id).populate("reviews");
    res.render("booklistings/show",{book});
}))

module.exports=router;