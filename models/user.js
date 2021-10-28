const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  birthdate: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ["BUSINESS", "STANDARD"],
  },
  language: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
