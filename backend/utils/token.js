const jwt = require("jsonwebtoken");

module.exports = function createToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
