const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const walletController = require("../controllers/wallet");

router.get("/", isLoggedIn, wrapAsync(walletController.showWallet));

module.exports = router;
