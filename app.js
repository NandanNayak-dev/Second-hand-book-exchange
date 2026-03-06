const express = require("express");
const app = express();
require("dotenv").config();

const mongoose = require("mongoose");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
const User = require("./models/user");
const booklistRoutes = require("./routes/booklist");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notification");
const walletRoutes = require("./routes/wallet");
const homeRoutes = require("./routes/home");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/bookstore");
}
main()
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(err));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/", homeRoutes);
app.use("/booklistings", booklistRoutes);
app.use("/booklistings/:id/reviews", reviewRoutes);
app.use("/notifications", notificationRoutes);
app.use("/wallet", walletRoutes);
app.use("/", userRoutes);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

