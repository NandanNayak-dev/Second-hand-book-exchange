const mongoose = require("mongoose");
const router = require("express").Router();
const User=require("../models/user");
const wrapAsync=require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup",(req,res)=>{
    res.render("users/signup");
})
router.post("/signup",wrapAsync(async(req,res,next)=>{
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
router.post("/login",saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true
}),async(req,res)=>{
    const redirectUrl = res.locals.redirectUrl || "/booklistings";
    console.log(redirectUrl);
    req.flash("success","Welcome Back");
    res.redirect(redirectUrl);
})



router.get("/logout", (req, res) => {
    req.logout((err)=>{
        if(err) return next(err);
        req.flash("success","Goodbye!");
        res.redirect("/booklistings");
    })
  });

  module.exports=router;