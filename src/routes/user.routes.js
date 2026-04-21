import express from "express";
import protect from "../middleware/auth.middleware.js";
import tenantMiddleware from "../middleware/tenant.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { getUsers, getUserStatus, getMyProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.use(protect, tenantMiddleware);

// Admin + Manager: see all users in company
router.get("/", roleMiddleware("admin", "manager"), getUsers);

// Admin + Manager: see online/offline status
router.get("/status", roleMiddleware("admin", "manager"), getUserStatus);

// Any authenticated user: own profile
router.get("/me", getMyProfile);

export default router;
