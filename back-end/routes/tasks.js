import express from "express";
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// GET all tasks for a specific user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const tasks = await db.all("SELECT * FROM tasks WHERE userId = ?", userId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE task
router.post("/", async (req, res) => {
  const { userId, name, dueDate, priority, category, status, description } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const newTask = {
    id: uuid(),
    userId,
    name: name || "",
    dueDate: dueDate || "",
    priority: priority || "",
    category: category || "",
    status: status || "",
    description: description || ""
  };

  try {
    await db.run(
      `INSERT INTO tasks (id, userId, name, dueDate, priority, category, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      newTask.id,
      newTask.userId,
      newTask.name,
      newTask.dueDate,
      newTask.priority,
      newTask.category,
      newTask.status,
      newTask.description
    );
    res.json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE task
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, dueDate, priority, category, status, description } = req.body;

  try {
    const existing = await db.get("SELECT * FROM tasks WHERE id = ?", id);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    const updated = {
      ...existing,
      name: name || existing.name,
      dueDate: dueDate || existing.dueDate,
      priority: priority || existing.priority,
      category: category || existing.category,
      status: status || existing.status,
      description: description || existing.description
    };

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
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.run("DELETE FROM tasks WHERE id=?", id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;