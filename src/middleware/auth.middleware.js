import jwt from "jsonwebtoken";
import { getCompanyDB } from "../config/connectionManager.js";
import { findUserById, getModelByRole } from "../models/tenant/userHelper.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    const conn = await getCompanyDB(decoded.dbName);

    const user = await findUserById(conn, decoded.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Update lastActiveAt
    const Model = getModelByRole(conn, user.role);
    await Model.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

    req.user   = user;
    req.dbName = decoded.dbName;
    req.conn   = conn;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;
