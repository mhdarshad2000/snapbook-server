const jwt = require("jsonwebtoken");

exports.authAdmin = async (req, res, next) => {
  try {
    let temp = req.header("Authorization");
    const token = temp ? temp.slice(7, temp.length) : "";
    if (!token) {
      return res.status(400).json({ message: "Invalid Athentification" });
    }
    jwt.verify(token, process.env.ADMIN_TOKEN_SECRET, (err, admin) => {
      if (err) {
        return res.status(400).json({ message: "Invalid Authentification1" });
      }
      req.admin = admin;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
