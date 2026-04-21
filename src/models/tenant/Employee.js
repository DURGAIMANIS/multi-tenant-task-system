import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role:     { type: String, default: "employee" },
    isOnline:     { type: Boolean, default: false },
    lastLoginAt:  { type: Date },
    lastActiveAt: { type: Date },
    resetPasswordToken:  String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, collection: "employees" }
);

export const getEmployeeModel = (conn) =>
  conn.models.Employee || conn.model("Employee", employeeSchema);
