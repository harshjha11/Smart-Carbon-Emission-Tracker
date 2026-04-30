const app = require("../Carbon-backend/server");
const connectDB = require("../Carbon-backend/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("Vercel API error:", err.message);
    return res.status(500).json({ message: "Server is not ready. Please try again." });
  }
};
