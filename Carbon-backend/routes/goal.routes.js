const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// Set or update goal
router.post("/", verifyToken, async (req, res) => {
  const weeklyGoal = Number(req.body.weeklyGoal);
  try {
    if (!Number.isFinite(weeklyGoal) || weeklyGoal <= 0) {
      return res.status(400).json({ message: "Weekly goal must be a positive number" });
    }

    const existing = await Goal.findOne({ user: req.user.id });
    const goalSetAt = new Date();

    await User.findByIdAndUpdate(req.user.id, {
      weeklyGoal,
      weeklyGoalSetAt: goalSetAt,
    });

    if (existing) {
      existing.weeklyGoal = weeklyGoal;
      existing.goalSetAt = goalSetAt;
      await existing.save();
      return res.json({ message: "Goal updated", goal: existing });
    }
    const newGoal = await Goal.create({ user: req.user.id, weeklyGoal, goalSetAt });
    res.json({ message: "Goal set", goal: newGoal });
  } catch (err) {
    res.status(500).json({ message: "Failed to set goal" });
  }
});

// Get current goal
router.get("/", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user.id });
    if (!goal) {
      const user = await User.findById(req.user.id).select("weeklyGoal weeklyGoalSetAt");
      return res.json({
        weeklyGoal: user?.weeklyGoal || 50,
        goalSetAt: user?.weeklyGoalSetAt || null,
      });
    }

    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch goal" });
  }
});

module.exports = router;
