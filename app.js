const express=require('express');
const app=express();

const mongoose = require("mongoose");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"public")))

const booklist=require("./models/booklist")

//-----------------MONGOOSE CONNECTION----------------
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/bookstore");
}
main().then(() => console.log("connected to database")).catch((err) => console.log(err));

//--------------MONGOOSE CONNECTION------------------

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
app.post("/booklistings",async(req,res)=>{
    const book=new booklist(req.body.booklisting);
    await book.save();
    res.redirect(`/booklistings/${book._id}`);
})
//==========================================

//==========Get Edit route============
app.get("/booklistings/:id/edit",async(req,res)=>{
    const {id}=req.params;
    const bookToEdit=await booklist.findById(id);
    res.render("booklistings/edit",{bookToEdit});
})
//=====Update route=========
app.put("/booklistings/:id",async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findByIdAndUpdate(id,req.body.booklisting,{new:true});
    res.redirect(`/booklistings/${book._id}`);

})

//Show Particular Book=====
app.get("/booklistings/:id",async(req,res)=>{
    const {id}=req.params;
    const book=await booklist.findById(id);
    res.render("booklistings/show",{book});
})


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
