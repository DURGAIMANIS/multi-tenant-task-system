import express from "express";
import passport from "../config/passport.js";
import {
  registerCompany,
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";
import tenantMiddleware from "../middleware/tenant.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

// Public
router.post("/company/register", registerCompany);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Returns whether Google OAuth is configured
router.get("/google/status", (req, res) => {
  res.json({ enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your_google_client_id") });
});

// Admin/Manager only — add user to company
router.post("/register-user", protect, tenantMiddleware, roleMiddleware("admin", "manager"), registerUser);

// Protected
router.post("/logout", protect, tenantMiddleware, logout);

// Google OAuth
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === "your_client_secret_here") {
    return res.status(503).json({ message: "Google OAuth not configured. Add GOOGLE_CLIENT_SECRET to .env" });
  }
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/?error=oauth_failed" }),
  (req, res) => {
    const { jwtToken, _id, name, email, role, companyName } = req.user;
    // Store token in localStorage via redirect with token in query
    res.redirect(`/dashboard.html?token=${jwtToken}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&role=${role}&id=${_id}&company=${encodeURIComponent(companyName)}`);
  }
);

export default router;
