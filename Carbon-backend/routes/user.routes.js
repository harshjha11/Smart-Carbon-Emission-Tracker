const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const User = require("../models/User");
const Activity = require("../models/Activity"); // Required for achievements
const Goal = require("../models/Goal");
const Achievement = require("../models/Achievement");
const uploadsDir = path.join(__dirname, "..", "uploads");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const removeUploadedFile = async (filename) => {
  if (!filename) return;
  const safeFilename = path.basename(filename);
  const fullPath = path.join(uploadsDir, safeFilename);

  try {
    await fs.unlink(fullPath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
};

const getSafeUser = (userId) => User.findById(userId).select("-password");

// GET /api/users/me - Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// PUT /api/users/me - Update name/email/password
router.put("/me", verifyToken, async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }

    if (typeof req.body.email === "string") {
      updates.email = req.body.email.trim().toLowerCase();
    }

    if (typeof req.body.password === "string" && req.body.password.trim()) {
      if (!passwordRegex.test(req.body.password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character",
        });
      }

      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    res.status(500).json({ message: "Failed to update profile" });
  }
});

// DELETE /api/users/me - Delete current user account
router.delete("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await removeUploadedFile(user.profilePic);

    await Promise.all([
      Activity.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      Achievement.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account" });
  }
});

// DELETE /api/users/profile-pic - Remove current user's profile picture
router.delete("/profile-pic", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePic = null;
    await user.save();

    const safeUser = await getSafeUser(user._id);
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Remove profile picture failed:", err);
    res.status(500).json({ message: "Failed to remove profile picture" });
  }
});

// POST /api/users/upload - Upload profile picture
router.post(
  "/update-profile-pic",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!req.file) {
        if (req.body?.imageUrl === "") {
          user.profilePic = null;
          await user.save();

          const safeUser = await getSafeUser(user._id);
          return res.json({ user: safeUser });
        }

        return res.status(400).json({ message: "No file uploaded" });
      }

      user.profilePic = req.file.path;
      await user.save();

      const safeUser = await getSafeUser(user._id);
      res.json({ user: safeUser });
    } catch (err) {
      console.error(err); // VERY IMPORTANT
      res.status(500).json({ message: "Upload failed" });
    }
  },
);

// GET /api/users/achievements - Get achievements for the current user
router.get("/achievements", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const activities = await Activity.find({ user: userId });

    const achievements = [];
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const totalCO2 = activities.reduce(
      (sum, act) => sum + (act.carbonFootprint || 0),
      0,
    );

    // 🎉 First Login Badge
    if (!user.hasLoggedIn) {
      achievements.push("🎉 First Login");
      user.hasLoggedIn = true;
      await user.save();
    }

    // 🌱 Eco Starter Badge
    if (activities.length >= 1) {
      achievements.push("🌱 Eco Starter");
    }

    // 🥇 Under Goal Champion Badge
    if (user.weeklyGoal && totalCO2 < user.weeklyGoal) {
      achievements.push("🥇 Under Goal Champion");
    }

    // ♻️ Weekly Logger Badge
    const recentActivities = activities.filter(
      (act) => new Date(act.createdAt) >= oneWeekAgo,
    );
    if (recentActivities.length > 0) {
      achievements.push("♻️ Weekly Logger");
    }

    res.json({ achievements });
  } catch (err) {
    console.error("Error generating achievements", err);
    res.status(500).json({ message: "Failed to load achievements" });
  }
});

module.exports = router;
