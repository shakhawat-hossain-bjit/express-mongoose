const mongoose = require("mongoose");
const databaseConnection = async (callback) => {
  try {
    // console.log(process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
      const client = await mongoose.connect(process.env.DATABASE_URL);
      if (client) {
        console.log("database connection successfully made");
        callback();
      }
    } else {
      console.log("Database URL is not provided");
    }
  } catch (error) {
    console.log("error ", error);
  }
};

module.exports = databaseConnection;
