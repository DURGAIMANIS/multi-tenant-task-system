import { getUsersService, getUserStatusService, getMyProfileService } from "../services/user.service.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getUsersService(req.conn);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserStatus = async (req, res) => {
  try {
    const users = await getUserStatusService(req.conn);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await getMyProfileService(req.user._id, req.conn);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
