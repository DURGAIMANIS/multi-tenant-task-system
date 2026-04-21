import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role:     { type: String, default: "manager" },
    isOnline:     { type: Boolean, default: false },
    lastLoginAt:  { type: Date },
    lastActiveAt: { type: Date },
    resetPasswordToken:  String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, collection: "managers" }
);

export const getManagerModel = (conn) =>
  conn.models.Manager || conn.model("Manager", managerSchema);
