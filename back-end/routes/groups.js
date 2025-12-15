import express from "express";
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

// GET all groups
router.get("/", async (req, res) => {
  const groups = await db.all("SELECT * FROM groups");
  res.json(groups);
});

// CREATE group
router.post("/", async (req, res) => {
  const group = {
    id: uuid(),
    name: req.body.name
  };

  await db.run(
    "INSERT INTO groups (id, name) VALUES (?, ?)",
    group.id,
    group.name
  );

  res.json(group);
});

export default router;
