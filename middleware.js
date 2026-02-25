const booklist = require("./models/booklist");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const {booklistingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // For non-GET requests, redirect back to the page user came from after login.
        const redirectUrl = req.method === "GET" ? req.originalUrl : (req.get("referer") || "/booklistings");
        req.session.redirectUrl = redirectUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const book = await booklist.findById(id);
    if (!book.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/booklistings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/booklistings/${id}`);
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/booklistings/${id}`);
    }

    next();
};

module.exports.validateBooklisting = (req, res, next) => {
    const { error } = booklistingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
