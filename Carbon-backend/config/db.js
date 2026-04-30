const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be set");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI.trim(), {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 15000,
    });
  }

  await connectionPromise;
  console.log("MongoDB Connected");
  return mongoose.connection;
};

module.exports = connectDB;
