require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const connectDB = require("./config/db");
const tipRoutes = require("./routes/tips.routes");
const goalRoutes = require("./routes/goal.routes");
const authRoutes = require("./routes/auth.routes");
const activityRoutes = require("./routes/activity.routes");
const achievementRoutes = require("./routes/achievement.routes");
const userRoutes = require("./routes/user.routes");
const offsetRoutes = require("./routes/offset.routes");

const app = express();
app.set("trust proxy", 1);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Carbon Backend is running successfully" });
});

const allowedOrigins = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
}));
app.use(express.json());

app.use("/api/tips", tipRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/offset", offsetRoutes);

const frontendDistPath = path.join(__dirname, "../Carbon-frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Carbon API is running. Build the frontend to serve the full app from this service.",
    });
  });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
