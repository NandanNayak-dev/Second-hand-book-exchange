const express=require('express');
const app=express();

const mongoose = require("mongoose");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");
const session = require("express-session");
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"public")))

const booklist=require("./models/booklist")
const Review=require("./models/review")


//-----------------MONGOOSE CONNECTION----------------
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookstore");
}
main().then(() => console.log("connected to database")).catch((err) => console.log(err));

//--------------MONGOOSE CONNECTION------------------
const sessionOptions={
    secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//========Flash Messages==========
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})
//===============================
app.get("/",(req,res)=>{
    res.send("Root Route");
})
//--------------ROUTES------------------
app.get("/booklistings",async(req,res)=>{
    const books=await booklist.find({});
    res.render("booklistings/index",{books});
})
//===============================
//New Book Route=====
app.get("/booklistings/new",async(req,res)=>{
    res.render("booklistings/new");
})
//Create Book Route=====
app.post("/booklistings",wrapAsync(async(req,res)=>{
    const book=new booklist(req.body.booklisting);
    await book.save();
    req.flash("success","Book Added Successfully");
    res.redirect(`/booklistings/${book._id}`);
}))
//==========================================

//==========Get Edit route============
app.get("/booklistings/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const bookToEdit=await booklist.findById(id);
    res.render("booklistings/edit",{bookToEdit});
}))
//=====Update route=========
app.put("/booklistings/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findByIdAndUpdate(id,req.body.booklisting,{new:true});
    req.flash("success","Book Updated Successfully");
    res.redirect(`/booklistings/${book._id}`);

}))

//======Delete route==========
app.delete("/booklistings/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findById(id);
    await Review.deleteMany({ _id: { $in: book.reviews } });
    req.flash("success","Book Deleted Successfully");
    res.redirect("/booklistings");
}))

//Show Particular Book=====
app.get("/booklistings/:id",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findById(id).populate("reviews");
    res.render("booklistings/show",{book});
}))

//=============REVIEWS===========================
app.post("/booklistings/:id/reviews",wrapAsync(async(req,res)=>{
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
app.delete("/booklistings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    const {id,reviewId}=req.params;
    await booklist.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted Successfully");
    res.redirect(`/booklistings/${id}`);
}))


//=====Error=======
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
})
app.use((err, req, res, next) => {
    let{statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error",{message});
})


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
