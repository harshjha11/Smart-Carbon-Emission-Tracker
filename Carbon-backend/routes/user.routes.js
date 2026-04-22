const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const User = require("../models/User");
const Activity = require("../models/Activity"); // Required for achievements
const Goal = require("../models/Goal");
const Achievement = require("../models/Achievement");
const uploadsDir = path.join(__dirname, "..", "uploads");

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

// GET /api/users/me - Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// PUT /api/users/me - Update name/email/password
router.put("/me", verifyToken, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true },
    ).select("-password");
    res.json(updated);
  } catch (err) {
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

// POST /api/users/upload - Upload profile picture
router.post(
  "/upload",
  verifyToken,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(404).json({ message: "No file uploaded" });
      }

      const existingUser = await User.findById(req.user.id);
      const previousProfilePic = existingUser?.profilePic;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePic: req.file.filename },
        { new: true },
      );
      // Remove old profile picture if it exists and is different from the new one
      if (previousProfilePic && previousProfilePic !== req.file.filename) {
        await removeUploadedFile(previousProfilePic);
      }
      // Return the new profile picture URL
      res.json({ message: "Uploaded", profilePic: user.profilePic });
    } catch (err) {
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  },
);

// GET /api/users/achievements - Get achievements for the current user
router.get("/achievements", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const activities = await Activity.find({ userId });

    const achievements = [];
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const totalCO2 = activities.reduce((sum, act) => sum + act.kg, 0);

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
    if (user.goal && totalCO2 < user.goal) {
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
