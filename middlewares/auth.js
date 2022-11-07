const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authUser = async (req, res, next) => {
  try {
    let temp = req.header("Authorization");
    const token = temp ? temp.slice(7, temp.length) : "";
    if (!token) {
      return res.status(400).json({ message: "Invalid Athentification" });
    }
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.status(400).json({ message: "Invalid Authentification1" });
      }
      req.user = user;
      
      const blocked = await User.findById(req.user.id);
      if (blocked.isBlocked) {
        return res
          .status(401)
          .json({ message: "The user is blocked by the admin" });
      }

      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
