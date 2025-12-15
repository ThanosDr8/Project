import express from "express";
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// GET all tasks
router.get("/", async (req, res) => {
  const tasks = await db.all("SELECT * FROM tasks");
  res.json(tasks);
});

// GET one task
router.get("/:id", async (req, res) => {
  const task = await db.get(
    "SELECT * FROM tasks WHERE id = ?",
    req.params.id
  );
  task
    ? res.json(task)
    : res.status(404).json({ error: "Task not found" });
});

// CREATE task
router.post("/", async (req, res) => {
  const newTask = {
    id: uuid(),
    ...req.body
  };

  await db.run(
    `INSERT INTO tasks 
     (id, name, dueDate, priority, category, status, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    newTask.id,
    newTask.name,
    newTask.dueDate,
    newTask.priority,
    newTask.category,
    newTask.status,
    newTask.description
  );

  res.json(newTask);
});

// UPDATE task
router.put("/:id", async (req, res) => {
  const existing = await db.get(
    "SELECT * FROM tasks WHERE id = ?",
    req.params.id
  );
  if (!existing)
    return res.status(404).json({ error: "Task not found" });

  const updated = { ...existing, ...req.body };

  await db.run(
    `UPDATE tasks SET
      name = ?, dueDate = ?, priority = ?, category = ?,
      status = ?, description = ?
     WHERE id = ?`,
    updated.name,
    updated.dueDate,
    updated.priority,
    updated.category,
    updated.status,
    updated.description,
    req.params.id
  );

  res.json(updated);
});

// DELETE task
router.delete("/:id", async (req, res) => {
  await db.run("DELETE FROM tasks WHERE id = ?", req.params.id);
  res.json({ message: "Task deleted" });
});

export default router;
