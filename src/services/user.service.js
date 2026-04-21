import { getAdminModel }    from "../models/tenant/Admin.js";
import { getManagerModel }  from "../models/tenant/Manager.js";
import { getEmployeeModel } from "../models/tenant/Employee.js";
import { findUserById }     from "../models/tenant/userHelper.js";

export const getUsersService = async (conn) => {
  const [admins, managers, employees] = await Promise.all([
    getAdminModel(conn).find().select("-password -resetPasswordToken -resetPasswordExpire"),
    getManagerModel(conn).find().select("-password -resetPasswordToken -resetPasswordExpire"),
    getEmployeeModel(conn).find().select("-password -resetPasswordToken -resetPasswordExpire"),
  ]);
  return { admins, managers, employees };
};

export const getUserStatusService = async (conn) => {
  const fields = "name email role isOnline lastLoginAt lastActiveAt";
  const [admins, managers, employees] = await Promise.all([
    getAdminModel(conn).find().select(fields),
    getManagerModel(conn).find().select(fields),
    getEmployeeModel(conn).find().select(fields),
  ]);
  return [...admins, ...managers, ...employees];
};

export const getMyProfileService = async (userId, conn) => {
  return findUserById(conn, userId);
};
