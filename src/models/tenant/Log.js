import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", "USER_LOGIN", "USER_LOGOUT"],
      required: true,
    },
    performedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taskId:        { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue:      { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });

export const getLogModel = (conn) =>
  conn.models.Log || conn.model("Log", logSchema);
