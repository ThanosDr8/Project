import express from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../middleware/auth.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// Register/Login endpoint
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

  try {
    const existing = await db.get("SELECT * FROM users WHERE username = ?", username);

    if (existing) {
      // Login
      const valid = await bcrypt.compare(password, existing.password);
      if (!valid) return res.status(401).json({ error: "Wrong password" });

      const token = generateToken(existing);
      return res.json({ id: existing.id, username: existing.username, token });
    }

    // Create new user
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: uuid(), username, password: hashed };

    await db.run(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      newUser.id, newUser.username, newUser.password
    );

    const token = generateToken(newUser);
    res.json({ id: newUser.id, username: newUser.username, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;