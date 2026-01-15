require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "UniFind backend running ✅" }));

// DB health check (for proof + debugging)
app.get("/health/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ db: "connected", result: rows[0] });
  } catch (e) {
    res.status(500).json({ db: "error", message: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ UniFind API running on http://localhost:${PORT}`));
