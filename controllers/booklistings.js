const booklist = require("../models/booklist");
const Review = require("../models/review");
const notifications = require("../models/buyAlert");
const User = require("../models/user");

module.exports.index = async (req, res) => {
  const books = await booklist.find({});
  res.render("booklistings/index", { books });
};

module.exports.renderNewForm = (req, res) => {
  res.render("booklistings/new");
};

module.exports.createBook = async (req, res) => {
  const book = new booklist(req.body.booklisting);
  book.owner = req.user._id;
  let url=req.file.path;
  book.image.url=url;
  book.image.filename=req.file.filename;
  await book.save();
  req.flash("success", "Book Added Successfully");
  res.redirect(`/booklistings/${book._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const bookToEdit = await booklist.findById(id);
  res.render("booklistings/edit", { bookToEdit });
};

module.exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const book = await booklist.findByIdAndUpdate(id, req.body.booklisting, { new: true });
  req.flash("success", "Book Updated Successfully");
  res.redirect(`/booklistings/${book._id}`);
};

module.exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  const book = await booklist.findById(id);
  await Review.deleteMany({ _id: { $in: book.reviews } });
  await booklist.findByIdAndDelete(id);
  req.flash("success", "Book Deleted Successfully");
  res.redirect("/booklistings");
};

module.exports.showBook = async (req, res) => {
  const { id } = req.params;
  const book = await booklist
    .findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  res.render("booklistings/show", { book });
};

module.exports.searchBooks = async (req, res) => {
  const search = (req.body.search || "").trim();
  const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const books = await booklist.find({
    $or: [
      { title: { $regex: safe, $options: "i" } },
      { author: { $regex: safe, $options: "i" } },
    ],
  });

  res.render("booklistings/index", { books });
};

module.exports.buyBook = async (req, res) => {
  const { bookId } = req.params;
  const currentUserId = req.user._id.toString();

  const book = await booklist.findById(bookId);
  if (!book) return res.redirect("/booklistings");

  if (!book.owner || book.owner.toString() === currentUserId) {
    req.flash("error", "You cannot buy this book");
    return res.redirect(`/booklistings/${bookId}`);
  }

  if (book.isBuyRequestSent) {
    req.flash("error", "Buy request is already sent for this book");
    return res.redirect(`/booklistings/${bookId}`);
  }

  if (typeof book.price !== "number" || book.price <= 0) {
    req.flash("error", "This book has an invalid price");
    return res.redirect(`/booklistings/${bookId}`);
  }

  const reservedBuyer = await User.findOneAndUpdate(
    { _id: currentUserId, wallet: { $gte: book.price } },
    { $inc: { wallet: -book.price } },
    { new: true }
  );

  if (!reservedBuyer) {
    req.flash("error", "You cannot buy this book because your wallet balance is insufficient");
    return res.redirect(`/booklistings/${bookId}`);
  }

  book.isBuyRequestSent = true;
  await book.save();

  try {
    const notification = new notifications({
      booklistingId: bookId,
      userId: currentUserId,
    });

    await notification.save();
    await User.findByIdAndUpdate(book.owner, { $push: { notifications: notification._id } });

    req.flash("success", "Buy request sent successfully");
    return res.redirect(`/booklistings/${bookId}`);
  } catch (err) {
    book.isBuyRequestSent = false;
    await book.save();
    await User.findByIdAndUpdate(currentUserId, { $inc: { wallet: book.price } });
    req.flash("error", "Could not place buy request. Wallet amount was restored.");
    return res.redirect(`/booklistings/${bookId}`);
  }
};
