import express from "express";
import protect from "../middleware/auth.middleware.js";
import tenantMiddleware from "../middleware/tenant.middleware.js";
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from "../controllers/task.controller.js";

const router = express.Router();

router.use(protect, tenantMiddleware);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
