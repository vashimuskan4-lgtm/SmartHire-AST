const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  type: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract"], default: "Full-time" },
  description: { type: String, required: true, trim: true },
  requirements: { type: String, default: "" },
  salary: { type: String, default: "" },
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
