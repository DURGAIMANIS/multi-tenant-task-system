import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    // Presence tracking
    isOnline: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },
    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1 });

export default mongoose.model("User", userSchema);
