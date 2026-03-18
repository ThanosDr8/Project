import express from "express";
import { db } from "../db.js";
import { v4 as uuid } from "uuid";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET all tasks for a specific user (requires auth)
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const tasks = await db.all("SELECT * FROM tasks WHERE userId = ?", userId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE task
router.post("/", authMiddleware, async (req, res) => {
  const { name, dueDate, priority, category, status, description } = req.body;
  const newTask = { id: uuid(), userId: req.userId, name, dueDate, priority, category, status, description };

  try {
    await db.run(
      `INSERT INTO tasks (id, userId, name, dueDate, priority, category, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      newTask.id, newTask.userId, newTask.name, newTask.dueDate, newTask.priority, newTask.category, newTask.status, newTask.description
    );
    res.json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE task
router.put("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const { name, dueDate, priority, category, status, description } = req.body;

  try {
    const existing = await db.get("SELECT * FROM tasks WHERE id = ?", id);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    if (existing.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const updated = { ...existing, name, dueDate, priority, category, status, description };

    await db.run(
      `UPDATE tasks SET name=?, dueDate=?, priority=?, category=?, status=?, description=? WHERE id=?`,
      updated.name, updated.dueDate, updated.priority, updated.category, updated.status, updated.description, id
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE task
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const task = await db.get("SELECT * FROM tasks WHERE id = ?", id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.userId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    await db.run("DELETE FROM tasks WHERE id=?", id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;