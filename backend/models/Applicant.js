const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: "" },
  skills: { type: String, default: "" },
  experience: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ["Applied", "Screening", "Interview", "Selected", "Rejected"],
    default: "Applied"
  },
  resume: { type: String, default: "" },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Applicant", applicantSchema);
