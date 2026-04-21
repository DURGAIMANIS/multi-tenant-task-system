import { getAdminModel }    from "./Admin.js";
import { getManagerModel }  from "./Manager.js";
import { getEmployeeModel } from "./Employee.js";

export const getModelByRole = (conn, role) => {
  if (role === "admin")    return getAdminModel(conn);
  if (role === "manager")  return getManagerModel(conn);
  return getEmployeeModel(conn);
};

// Search across all three collections for a user by email
export const findUserByEmail = async (conn, email) => {
  const Admin    = getAdminModel(conn);
  const Manager  = getManagerModel(conn);
  const Employee = getEmployeeModel(conn);

  return (
    (await Admin.findOne({ email })) ||
    (await Manager.findOne({ email })) ||
    (await Employee.findOne({ email }))
  );
};

// Find user by ID across all three collections
export const findUserById = async (conn, id) => {
  const Admin    = getAdminModel(conn);
  const Manager  = getManagerModel(conn);
  const Employee = getEmployeeModel(conn);

  return (
    (await Admin.findById(id)) ||
    (await Manager.findById(id)) ||
    (await Employee.findById(id))
  );
};
