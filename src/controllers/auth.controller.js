import {
  registerCompanyService,
  registerUserService,
  loginService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service.js";

export const registerCompany = async (req, res) => {
  try {
    const { name, email, industry, adminName, adminPassword, role } = req.body;
    if (!name || !email || !adminName || !adminPassword)
      return res.status(400).json({ message: "name, email, adminName, adminPassword are required" });

    const result = await registerCompanyService({ companyName: name, email, industry, adminName, adminPassword, role });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "name, email, password are required" });

    const result = await registerUserService({ name, email, password, role }, req.conn);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const result = await loginService({ email, password });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    await logoutService(req.user._id, req.user.role, req.conn);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordService(req.body.email);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.json({ message: "Reset link generated", resetLink: result.resetLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await resetPasswordService(req.params.token, req.body.password);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
