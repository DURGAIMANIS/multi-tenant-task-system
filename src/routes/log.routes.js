import express from "express";
import protect from "../middleware/auth.middleware.js";
import tenantMiddleware from "../middleware/tenant.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { getLogs } from "../controllers/log.controller.js";

const router = express.Router();

router.get("/", protect, tenantMiddleware, roleMiddleware("admin"), getLogs);

export default router;
