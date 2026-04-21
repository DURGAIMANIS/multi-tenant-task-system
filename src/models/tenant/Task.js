import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status:      { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    priority:    { type: String, enum: ["low", "medium", "high"], default: "medium" },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

taskSchema.index({ createdAt: -1 });

export const getTaskModel = (conn) =>
  conn.models.Task || conn.model("Task", taskSchema);
