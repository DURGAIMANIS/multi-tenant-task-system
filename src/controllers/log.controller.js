import { getLogModel } from "../models/tenant/Log.js";

export const getLogs = async (req, res) => {
  try {
    const Log = getLogModel(req.conn);
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      Log.find()
        .populate("performedBy", "name email role")
        .populate("taskId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Log.countDocuments(),
    ]);

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
