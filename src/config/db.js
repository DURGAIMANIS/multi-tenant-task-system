import mongoose from "mongoose";

const MONGO_BASE = process.env.MONGO_BASE || "mongodb://localhost:27017";

const connectMainDB = async () => {
  try {
    const conn = await mongoose.connect(`${MONGO_BASE}/company_main_db`);
    console.log(`Main DB connected ✅: ${conn.connection.host}/company_main_db`);
  } catch (err) {
    console.error("Main DB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectMainDB;
