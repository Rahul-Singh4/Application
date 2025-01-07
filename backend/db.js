// backend/db.js
const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection string
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);
// Create a Schema for Users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

//Create a Schema for Account
const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

// Create a model from the Account
const Account = mongoose.model("Account", accountSchema);

module.exports = {
  User,
  Account,
};
