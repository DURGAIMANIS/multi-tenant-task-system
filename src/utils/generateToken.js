import jwt from "jsonwebtoken";

const generateToken = (user, dbName) =>
  jwt.sign(
    { userId: user._id, dbName, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

export default generateToken;
