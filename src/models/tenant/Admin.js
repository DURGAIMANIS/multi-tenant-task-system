import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role:     { type: String, default: "admin" },
    isOnline:     { type: Boolean, default: false },
    lastLoginAt:  { type: Date },
    lastActiveAt: { type: Date },
    resetPasswordToken:  String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, collection: "admins" }
);

export const getAdminModel = (conn) =>
  conn.models.Admin || conn.model("Admin", adminSchema);
