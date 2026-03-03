const User = require("../models/user");

module.exports.showWallet = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("wallet", { user });
};
