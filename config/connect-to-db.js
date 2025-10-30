const mongoose = require("mongoose");
require("dotenv").config();

module.exports.connectToDB = () => {

  MONGO_URI = process.env.MONGODB_URI;

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log("Connection was a hit.");
    })
    .catch(function (err) {
      console.log("Failed due to:", err);
    })
}