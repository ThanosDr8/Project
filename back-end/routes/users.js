import express from "express";
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// SIGN IN / REGISTER (απλό)
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // Έλεγχος αν υπάρχει χρήστης
  const existing = await db.get(
    "SELECT * FROM users WHERE username = ?",
    username
  );

  if (existing) {
    // Login
    if (existing.password !== password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    return res.json({
      id: existing.id,
      username: existing.username
    });
  }

  // Register
  const user = {
    id: uuid(),
    username,
    password
  };

  await db.run(
    "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
    user.id,
    user.username,
    user.password
  );

  res.json({
    id: user.id,
    username: user.username
  });
});

export default router;
