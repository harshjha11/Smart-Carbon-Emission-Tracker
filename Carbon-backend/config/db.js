const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be set");
    }

    await mongoose.connect(process.env.MONGO_URI.trim(), {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 15000,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
