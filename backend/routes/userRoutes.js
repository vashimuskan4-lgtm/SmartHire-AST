const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

router.get("/me", protect, authorize("recruiter", "admin"), async (req, res) => {
  res.json(req.user);
});

router.put("/me", protect, authorize("recruiter", "admin"), async (req, res) => {
  const update = {};
  ["name", "phone", "company"].forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (req.body.password) update.password = await bcrypt.hash(req.body.password, 12);

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select("-password");
  res.json(user);
});

module.exports = router;
