const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const createToken = require("../utils/token");

router.post("/register", async (req, res) => {
  const { name, email, password, company, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email is already registered" });

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, company, phone });
  res.status(201).json({
    token: createToken(user._id, user.role),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({
    token: createToken(user._id, user.role),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone }
  });
});

module.exports = router;
