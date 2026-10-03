const router = require("express").Router();
const Applicant = require("../models/Applicant");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const sendEmail = require("../utils/mailer");

router.use(protect, authorize("recruiter", "admin"));

router.get("/", async (req, res) => {
  const { search = "", status, job, page = 1, limit = 8, sort = "-createdAt" } = req.query;
  const filter = { createdBy: req.user._id };
  if (status) filter.status = status;
  if (job) filter.job = job;
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { skills: { $regex: search, $options: "i" } }
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [applicants, total] = await Promise.all([
    Applicant.find(filter).populate("job", "title").sort(sort).skip(skip).limit(Number(limit)),
    Applicant.countDocuments(filter)
  ]);
  res.json({ applicants, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
});

router.post("/", upload.single("resume"), async (req, res) => {
  const job = await Job.findOne({ _id: req.body.job, createdBy: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });

  const applicant = await Applicant.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    skills: req.body.skills,
    experience: Number(req.body.experience || 0),
    job: job._id,
    createdBy: req.user._id,
    resume: req.file ? `/uploads/${req.file.filename}` : ""
  });

  try {
    await sendEmail({
      to: applicant.email,
      subject: "Application received - SmartHire",
      text: `Hello ${applicant.name}, your application for ${job.title} has been received.`
    });
  } catch (e) { console.error("Email error:", e.message); }

  res.status(201).json(await applicant.populate("job", "title"));
});

router.patch("/:id/status", async (req, res) => {
  const allowed = ["Applied", "Screening", "Interview", "Selected", "Rejected"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
  const applicant = await Applicant.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { status: req.body.status }, { new: true, runValidators: true }
  ).populate("job", "title");
  if (!applicant) return res.status(404).json({ message: "Applicant not found" });
  res.json(applicant);
});

router.delete("/:id", async (req, res) => {
  const applicant = await Applicant.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!applicant) return res.status(404).json({ message: "Applicant not found" });
  res.json({ message: "Applicant deleted" });
});

module.exports = router;
