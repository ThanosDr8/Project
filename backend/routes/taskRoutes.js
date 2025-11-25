//taskRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();
router.use(protect);
router.post("/", createTask);
router.get("/",getTask);
router.put("/:id",updateTask);
router.delete("/:id",deleteTask);

export default router;