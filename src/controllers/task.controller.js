import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
} from "../services/task.service.js";

export const createTask = async (req, res) => {
  try {
    const task = await createTaskService(req.body, req.user, req.conn);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const result = await getTasksService(req.conn, req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await getTaskByIdService(req.params.id, req.conn);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const result = await updateTaskService(req.params.id, req.body, req.user, req.conn);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.json(result.task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await deleteTaskService(req.params.id, req.user, req.conn);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
