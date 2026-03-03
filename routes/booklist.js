const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateBooklisting } = require("../middleware");
const bookController = require("../controllers/booklistings");

router.get("/", wrapAsync(bookController.index));
router.get("/new", isLoggedIn, bookController.renderNewForm);
router.post("/", isLoggedIn, validateBooklisting, wrapAsync(bookController.createBook));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(bookController.renderEditForm));
router.put("/:id", isLoggedIn, isOwner, validateBooklisting, wrapAsync(bookController.updateBook));
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(bookController.deleteBook));

router.get("/:id", wrapAsync(bookController.showBook));
router.post("/search", wrapAsync(bookController.searchBooks));
router.post("/:ownerId/:currentUserId/:bookId/buy", isLoggedIn, wrapAsync(bookController.buyBook));

module.exports = router;
