const notifications = require("../models/buyAlert");
const User = require("../models/user");
const booklist = require("../models/booklist");

module.exports.listNotifications = async (req, res) => {
  const userWithNotifications = await User.findById(req.user._id).populate({
    path: "notifications",
    populate: [
      { path: "userId", select: "username email" },
      { path: "booklistingId", select: "title price image" },
    ],
  });
  res.render("notifications", { notifications: userWithNotifications.notifications });
};

module.exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  const notification = await notifications
    .findById(notificationId)
    .populate("booklistingId")
    .populate("userId");

  if (!notification) {
    req.flash("error", "Notification not found");
    return res.redirect("/notifications");
  }

  const owner = await User.findById(req.user._id);
  const isOwnerNotification = owner.notifications.some(
    (id) => id.toString() === notificationId
  );

  if (!isOwnerNotification) {
    req.flash("error", "You are not allowed to remove this notification");
    return res.redirect("/notifications");
  }

  if (notification.booklistingId) {
    notification.booklistingId.isBuyRequestSent = false;
    await notification.booklistingId.save();
  }

  if (
    notification.userId &&
    notification.booklistingId &&
    typeof notification.booklistingId.price === "number"
  ) {
    await User.findByIdAndUpdate(notification.userId._id, {
      $inc: { wallet: notification.booklistingId.price },
    });
  }

  await User.findByIdAndUpdate(req.user._id, { $pull: { notifications: notificationId } });
  await notifications.findByIdAndDelete(notificationId);

  req.flash("success", "Buy request removed and buyer wallet refunded");
  res.redirect("/notifications");
};

module.exports.sellBook = async (req, res) => {
  const { notificationId, bookId, buyerId } = req.params;

  const book = await booklist.findById(bookId);
  if (!book) return res.redirect("/notifications");

  book.owner = buyerId;
  book.isBuyRequestSent = false;
  await book.save();

  await notifications.findByIdAndDelete(notificationId);
  await User.findByIdAndUpdate(req.user._id, { $pull: { notifications: notificationId } });

  const seller = await User.findById(req.user._id);
  seller.wallet += book.price;
  await seller.save();

  req.flash("success", "Book sold successfully");
  res.redirect(`/booklistings/${bookId}`);
};
