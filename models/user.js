const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: "BuyAlert",
    },
  ],
  wallet: {
    type: Number,
    default: 1000,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

