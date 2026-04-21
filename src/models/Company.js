import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, unique: true, trim: true },
    dbName:      { type: String, required: true, unique: true },
    email:       { type: String, required: true, lowercase: true },
    industry:    { type: String },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Bound to the default mongoose connection (company_main_db)
export default mongoose.model("Company", companySchema);
