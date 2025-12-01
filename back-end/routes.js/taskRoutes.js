import express from "express";
import { readDB, writeDB } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// GET all tasks
router.get("/", async (req, res) => {
  const db = await readDB();
  res.json(db.tasks);
});

// GET one task
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const task = db.tasks.find(t => t.id === req.params.id);
  task ? res.json(task) : res.status(404).json({ error: "Task not found" });
});

// CREATE task
router.post("/", async (req, res) => {
  const db = await readDB();
  const newTask = {
    id: uuid(),
    name: req.body.name,
    dueDate: req.body.dueDate,
    priority: req.body.priority,
    category: req.body.category,
    status: req.body.status,
    description: req.body.description
  };
  db.tasks.push(newTask);
  await writeDB(db);
  res.json(newTask);
});

// UPDATE task
router.put("/:id", async (req, res) => {
  const db = await readDB();
  const index = db.tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  db.tasks[index] = { ...db.tasks[index], ...req.body };
  await writeDB(db);
  res.json(db.tasks[index]);
});

// DELETE task
router.delete("/:id", async (req, res) => {
  const db = await readDB();
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  await writeDB(db);
  res.json({ message: "Task deleted" });
});

export default router;
