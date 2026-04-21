import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role:     { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
    isOnline:     { type: Boolean, default: false },
    lastLoginAt:  { type: Date },
    lastActiveAt: { type: Date },
    resetPasswordToken:  String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Returns the User model bound to the given company connection
export const getUserModel = (conn) =>
  conn.models.User || conn.model("User", userSchema);
