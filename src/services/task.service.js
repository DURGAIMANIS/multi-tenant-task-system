import { getTaskModel } from "../models/tenant/Task.js";
import { getLogModel }  from "../models/tenant/Log.js";
import { findUserById } from "../models/tenant/userHelper.js";

const audit = (conn, action, taskId, userId, prev, next) => {
  const Log = getLogModel(conn);
  return Log.create({ action, taskId, performedBy: userId, previousValue: prev, newValue: next });
};

const resolveUser = async (conn, id) => {
  if (!id) return null;
  const u = await findUserById(conn, id);
  return u ? { _id: u._id, name: u.name, email: u.email, role: u.role } : null;
};

export const createTaskService = async (body, user, conn) => {
  const Task = getTaskModel(conn);
  const { title, description, status, priority, assignedTo } = body;
  const task = await Task.create({
    title, description, status, priority, assignedTo,
    createdBy: user._id,
  });
  await audit(conn, "CREATE_TASK", task._id, user._id, null, { title, status, priority });
  return task;
};

export const getTasksService = async (conn, query) => {
  const Task = getTaskModel(conn);
  const { status, priority, search, page = 1, limit = 10 } = query;

  const filter = {};
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  if (search)   filter.title    = { $regex: search, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Task.countDocuments(filter),
  ]);

  // Manually resolve user info
  const enriched = await Promise.all(tasks.map(async (t) => {
    const obj = t.toObject();
    obj.createdBy  = await resolveUser(conn, t.createdBy);
    obj.assignedTo = await resolveUser(conn, t.assignedTo);
    return obj;
  }));

  return { tasks: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
};

export const getTaskByIdService = async (id, conn) => {
  const Task = getTaskModel(conn);
  const task = await Task.findById(id);
  if (!task) return null;
  const obj = task.toObject();
  obj.createdBy  = await resolveUser(conn, task.createdBy);
  obj.assignedTo = await resolveUser(conn, task.assignedTo);
  return obj;
};

export const updateTaskService = async (id, updates, user, conn) => {
  const Task = getTaskModel(conn);
  const task = await Task.findById(id);
  if (!task) return { error: "Task not found", status: 404 };

  if (user.role === "employee" &&
    task.createdBy.toString() !== user._id.toString() &&
    task.assignedTo?.toString() !== user._id.toString())
    return { error: "Not allowed", status: 403 };

  const prev = { title: task.title, status: task.status, priority: task.priority };
  const { title, description, status, priority, assignedTo } = updates;
  Object.assign(task, { title, description, status, priority, assignedTo });
  await task.save();
  await audit(conn, "UPDATE_TASK", task._id, user._id, prev, updates);
  return { task };
};

export const deleteTaskService = async (id, user, conn) => {
  const Task = getTaskModel(conn);
  const task = await Task.findById(id);
  if (!task) return { error: "Task not found", status: 404 };

  if (user.role === "employee" && task.createdBy.toString() !== user._id.toString())
    return { error: "Not allowed", status: 403 };

  await task.deleteOne();
  await audit(conn, "DELETE_TASK", task._id, user._id, { title: task.title }, null);
  return { success: true };
};
