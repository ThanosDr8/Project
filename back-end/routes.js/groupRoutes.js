import express from "express";
import { readDB, writeDB } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// Get all groups
router.get("/", async (req, res) => {
  const db = await readDB();
  res.json(db.groups);
});

// Create new group
router.post("/", async (req, res) => {
  const db = await readDB();
  const group = {
    id: uuid(),
    name: req.body.name
  };
  db.groups.push(group);
  await writeDB(db);
  res.json(group);
});

export default router;
