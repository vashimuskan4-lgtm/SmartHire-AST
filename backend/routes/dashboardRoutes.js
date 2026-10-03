const router = require("express").Router();
const Applicant = require("../models/Applicant");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/auth");

router.get("/stats", protect, authorize("recruiter", "admin"), async (req, res) => {
  const owner = req.user._id;
  const [jobs, applicants, statusCounts] = await Promise.all([
    Job.countDocuments({ createdBy: owner }),
    Applicant.countDocuments({ createdBy: owner }),
    Applicant.aggregate([
      { $match: { createdBy: owner } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
  ]);

  const status = {};
  statusCounts.forEach(x => status[x._id] = x.count);
  res.json({
    jobs,
    openJobs: await Job.countDocuments({ createdBy: owner, status: "Open" }),
    applicants,
    applied: status.Applied || 0,
    screening: status.Screening || 0,
    interview: status.Interview || 0,
    selected: status.Selected || 0,
    rejected: status.Rejected || 0
  });
});

module.exports = router;
