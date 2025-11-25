//projectRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createProject, getProjects } from "../controllers/projectController.js";

const router = express.Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);

export default router;
