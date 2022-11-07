const express = require("express");
const {
  createPost,
  getAllPosts,
  comment,
  savePost,
  deletePost,
  reportPost,
  deleteComment,
  savedPosts,
} = require("../controllers/posts");
const { authUser } = require("../middlewares/auth");
const router = express.Router();

router.post("/createPost", authUser, createPost);
router.get("/getPosts", authUser, getAllPosts);
router.put("/comment", authUser, comment);
router.put("/savePost/:id", authUser, savePost);
router.delete("/deletePost/:id", authUser, deletePost);
router.put("/reportPost/:id", authUser, reportPost);
router.put("/deleteComment/:id",authUser, deleteComment);
router.get("/savedPost",authUser, savedPosts);


module.exports = router;
