const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const notificationController = require("../controllers/notifications");

router.get("/", isLoggedIn, wrapAsync(notificationController.listNotifications));
router.delete("/:notificationId", isLoggedIn, wrapAsync(notificationController.deleteNotification));
router.post(
  "/:notificationId/:bookId/:buyerId/sell",
  isLoggedIn,
  wrapAsync(notificationController.sellBook)
);

module.exports = router;
