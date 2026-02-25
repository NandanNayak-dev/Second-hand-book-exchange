const express=require('express');
const app=express();

const mongoose = require("mongoose");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const ExpressError = require("./utils/ExpressError");
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
const User=require("./models/user");

const booklistRoutes=require("./routes/booklist")
const reviewRoutes=require("./routes/review")
const userRoutes=require("./routes/user")

const notifications=require("./models/buyAlert");
const { isLoggedIn } = require("./middleware");
const booklist = require('./models/booklist');
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
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//========Flash Messages==========
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currentUser=req.user;
  //Notificaion count
  
  next();
})

//===============================
app.get("/",(req,res)=>{
    res.render("home");
})

app.get("/notifications",isLoggedIn, async (req, res, next) => {
  try {
    const userWithNotifications = await User.findById(req.user._id).populate({
      path: "notifications",
      populate: [
        { path: "userId", select: "username email" },          // buyer
        { path: "booklistingId", select: "title price image" } // book
      ]
    });
    // res.send(userWithNotifications.notifications);
    res.render("notifications", { notifications: userWithNotifications.notifications });
    // or: res.json(userWithNotifications.notifications);
  } catch (err) {
    next(err);
  }
});
app.delete("/notifications/:notificationId", async (req, res, next) => {
  await notifications.findByIdAndDelete(req.params.notificationId);
  res.redirect("/notifications");
})

app.post("/notifications/:notificationId/:bookId/:buyerId/approve", isLoggedIn, async (req, res, next) => {
  const { notificationId, bookId, buyerId } = req.params;

  const book = await booklist.findById(bookId);
  if (!book) return res.redirect("/notifications");

  book.owner = buyerId;
  await book.save();

  await notifications.findByIdAndDelete(notificationId);
  // await User.findByIdAndUpdate(req.user._id, { $pull: { notifications: notificationId } });

  res.redirect(`/booklistings/${bookId}`);
});


//-----------Routes-----------
app.use("/booklistings",booklistRoutes);
app.use("/booklistings/:id/reviews",reviewRoutes);
app.use("/",userRoutes);
//--------------Routes------------------


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
