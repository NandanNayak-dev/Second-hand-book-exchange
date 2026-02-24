const mongoose = require("mongoose");
const router = require("express").Router();
const User=require("../models/user");
const wrapAsync=require("../utils/wrapAsync");
const passport = require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup");
})
router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user=new User({email,username});
        const registeredUser=await User.register(user,password);
        req.login(registeredUser,(err)=>{
            if(err) return next(err);
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/booklistings");
        })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}))



router.get("/login",async(req,res)=>{
    res.render("users/login");
})
router.post("/login",passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true
}),async(req,res)=>{
    req.flash("success","Welcome Back");
    res.redirect("/booklistings");
})
module.exports=router;