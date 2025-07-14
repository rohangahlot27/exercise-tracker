const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create user
router.post("/users", async (req, res) => {
  const { username } = req.body;
  try {
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  const users = await User.find({}, "username _id");
  res.json(users);
});

// Add exercise
router.post("/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const exercise = {
      description,
      duration: parseInt(duration),
      date
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: date.toDateString(),
      duration: exercise.duration,
      description: exercise.description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logs
router.get("/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let log = [...user.log];

    if (from) {
      const fromDate = new Date(from);
      log = log.filter((e) => e.date >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      log = log.filter((e) => e.date <= toDate);
    }

    if (limit) {
      log = log.slice(0, parseInt(limit));
    }

    const formattedLog = log.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }));

    res.json({
      username: user.username,
      count: formattedLog.length,
      _id: user._id,
      log: formattedLog
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
