const express = require("express");
const {
  login,
  getUsers,
  blockUser,
  getPosts,
  deletePost,
  deleteComment,
  getReportPost,
  reportPost
} = require("../controllers/admin");
const { authAdmin } = require("../middlewares/authAdmin");
const router = express.Router();
router.post("/admin", login);
router.get("/admin/getUsers", authAdmin, getUsers);
router.put("/admin/blockUser/:id", authAdmin, blockUser);
router.get("/admin/getPosts/:id", authAdmin, getPosts);
router.delete("/admin/post/:id", authAdmin, deletePost);
router.put("/admin/deleteComment/:id", authAdmin, deleteComment);
router.get("/admin/getPostReports", authAdmin, getReportPost);
router.post("/admin/report/:id", authAdmin, reportPost);

module.exports = router;
