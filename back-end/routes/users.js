import express from "express";
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// Register/Login endpoint
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    // Έλεγχος αν υπάρχει ο χρήστης
    const existing = await db.get(
      "SELECT * FROM users WHERE username = ?",
      username
    );

    if (existing) {
      // Login
      if (existing.password !== password) {
        return res.status(401).json({ error: "Wrong password" });
      }
      return res.json({ id: existing.id, username: existing.username });
    }

    // Δημιουργία νέου χρήστη
    const newUser = {
      id: uuid(),
      username,
      password
    };

    await db.run(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      newUser.id,
      newUser.username,
      newUser.password
    );

    return res.json({ id: newUser.id, username: newUser.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;