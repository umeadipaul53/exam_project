const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(`failed to connect to DB due to error: ${err}`);
  });

module.exports = mongoose;
