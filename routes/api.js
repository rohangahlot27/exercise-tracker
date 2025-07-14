const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create new user
router.post("/users", async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  const users = await User.find({}, "username _id");
  res.json(users);
});

// Add exercise
router.post("/users/:_id/exercises", async (req, res) => {
  try {
    const { description, duration, date } = req.body;
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add exercise" });
  }
});

// Get user logs with optional filters
router.get("/users/:_id/logs", async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let log = user.log.map(entry => ({
      description: entry.description,
      duration: entry.duration,
      date: entry.date.toDateString()
    }));

    if (from) {
      const fromDate = new Date(from);
      log = log.filter(entry => new Date(entry.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      log = log.filter(entry => new Date(entry.date) <= toDate);
    }

    if (limit) {
      log = log.slice(0, parseInt(limit));
    }

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get logs" });
  }
});

module.exports = router;
