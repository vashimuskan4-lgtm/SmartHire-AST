const router = require("express").Router();
const Job = require("../models/Job");
const Applicant = require("../models/Applicant");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("recruiter", "admin"));

router.get("/", async (req, res) => {
  const { search = "", page = 1, limit = 8, status } = req.query;
  const filter = { createdBy: req.user._id };
  if (status) filter.status = status;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { department: { $regex: search, $options: "i" } },
    { location: { $regex: search, $options: "i" } }
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter)
  ]);
  res.json({ jobs, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
});

router.post("/", async (req, res) => {
  const job = await Job.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(job);
});

router.put("/:id", async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    req.body, { new: true, runValidators: true }
  );
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
});

router.delete("/:id", async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  await Applicant.deleteMany({ job: job._id, createdBy: req.user._id });
  res.json({ message: "Job deleted" });
});

module.exports = router;
