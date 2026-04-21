import mongoose from "mongoose";

const MONGO_BASE = process.env.MONGO_BASE || "mongodb://localhost:27017";

// Cache: dbName -> mongoose.Connection
const connections = {};

export const getCompanyDB = async (dbName) => {
  if (connections[dbName]) return connections[dbName];

  const conn = await mongoose.createConnection(`${MONGO_BASE}/${dbName}`).asPromise();
  connections[dbName] = conn;
  console.log(`Company DB connected ✅: ${dbName}`);
  return conn;
};

// Generate sanitized DB name from company name
// e.g. "Lenovo Corp" -> "company_lenovo_corp_db"
export const generateDbName = (companyName) => {
  const sanitized = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `company_${sanitized}_db`;
};
