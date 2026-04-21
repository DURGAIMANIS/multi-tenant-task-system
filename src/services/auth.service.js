import bcrypt from "bcryptjs";
import crypto from "crypto";
import Company from "../models/Company.js";
import { getCompanyDB, generateDbName } from "../config/connectionManager.js";
import { getModelByRole, findUserByEmail } from "../models/tenant/userHelper.js";
import { getLogModel } from "../models/tenant/Log.js";
import generateToken from "../utils/generateToken.js";

export const registerCompanyService = async ({ companyName, email, industry, adminName, adminPassword, role }) => {

  if (role === "admin") {
    const existing = await Company.findOne({ companyName });
    if (existing) return { error: "Company name already taken", status: 400 };

    const dbName = generateDbName(companyName);
    const company = await Company.create({ companyName, dbName, email, industry });

    const conn = await getCompanyDB(dbName);
    const Model = getModelByRole(conn, "admin");

    const existingUser = await Model.findOne({ email });
    if (existingUser) return { error: "Email already registered", status: 400 };

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = await Model.create({
      name: adminName, email, password: hashed, role: "admin",
      isOnline: true, lastLoginAt: new Date(), lastActiveAt: new Date(),
    });

    return {
      token: generateToken(admin, dbName),
      company: { id: company._id, companyName, dbName },
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    };

  } else {
    const company = await Company.findOne({ companyName });
    if (!company) return { error: `Company "${companyName}" not found`, status: 404 };

    const conn = await getCompanyDB(company.dbName);
    const existingUser = await findUserByEmail(conn, email);
    if (existingUser) return { error: "Email already registered", status: 400 };

    const Model = getModelByRole(conn, role);
    const hashed = await bcrypt.hash(adminPassword, 10);
    const user = await Model.create({
      name: adminName, email, password: hashed, role,
      isOnline: true, lastLoginAt: new Date(), lastActiveAt: new Date(),
    });

    return {
      token: generateToken(user, company.dbName),
      company: { id: company._id, companyName, dbName: company.dbName },
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
  }
};

export const registerUserService = async ({ name, email, password, role }, conn) => {
  const existingUser = await findUserByEmail(conn, email);
  if (existingUser) return { error: "Email already registered", status: 400 };

  const Model = getModelByRole(conn, role || "employee");
  const hashed = await bcrypt.hash(password, 10);
  const user = await Model.create({ name, email, password: hashed, role: role || "employee" });
  return { user: { id: user._id, name, email, role: user.role } };
};

export const loginService = async ({ email, password }) => {
  const companies = await Company.find({ isActive: true });

  for (const company of companies) {
    const conn = await getCompanyDB(company.dbName);
    const user = await findUserByEmail(conn, email);

    if (user && user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return { error: "Invalid credentials", status: 401 };

      const Model = getModelByRole(conn, user.role);
      await Model.findByIdAndUpdate(user._id, {
        isOnline: true, lastLoginAt: new Date(), lastActiveAt: new Date(),
      });

      const Log = getLogModel(conn);
      await Log.create({ action: "USER_LOGIN", performedBy: user._id });

      return {
        token: generateToken(user, company.dbName),
        user: { id: user._id, name: user.name, email, role: user.role, companyName: company.companyName, dbName: company.dbName },
      };
    }
  }

  return { error: "Invalid credentials", status: 401 };
};

export const logoutService = async (userId, role, conn) => {
  const Model = getModelByRole(conn, role);
  const Log   = getLogModel(conn);
  await Model.findByIdAndUpdate(userId, { isOnline: false, lastActiveAt: new Date() });
  await Log.create({ action: "USER_LOGOUT", performedBy: userId });
};

export const forgotPasswordService = async (email) => {
  const companies = await Company.find({ isActive: true });

  for (const company of companies) {
    const conn = await getCompanyDB(company.dbName);
    const user = await findUserByEmail(conn, email);

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken  = token;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      await user.save();
      return { resetLink: `${process.env.BASE_URL || "http://localhost:5000"}/api/auth/reset-password/${token}` };
    }
  }

  return { error: "User not found", status: 404 };
};

export const resetPasswordService = async (token, newPassword) => {
  const companies = await Company.find({ isActive: true });

  for (const company of companies) {
    const conn = await getCompanyDB(company.dbName);
    const user = await findUserByEmail(conn, ""); // search by token instead

    // Search all three collections for the reset token
    const Admin    = getModelByRole(conn, "admin");
    const Manager  = getModelByRole(conn, "manager");
    const Employee = getModelByRole(conn, "employee");

    const foundUser =
      (await Admin.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } })) ||
      (await Manager.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } })) ||
      (await Employee.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } }));

    if (foundUser) {
      foundUser.password            = await bcrypt.hash(newPassword, 10);
      foundUser.resetPasswordToken  = undefined;
      foundUser.resetPasswordExpire = undefined;
      await foundUser.save();
      return { success: true };
    }
  }

  return { error: "Invalid or expired token", status: 400 };
};
