const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const apiRoutes = require("./routes/api");
const cors = require("cors");

dotenv.config();
const app = express();

// Required by freeCodeCamp
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes must match exactly
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
