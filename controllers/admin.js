const Admin = require("../models/admin");
const User = require("../models/user");
const Post = require("../models/posts");
const bcrypt = require("bcrypt");
const { generateAdminToken } = require("../helpers/token");
const Report = require("../models/reports");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(400).json({ message: "You are not authorized" });
    const check = await bcrypt.compare(password, admin.password);
    if (!check)
      return res.status(400).json({ message: "Bad Credentials Enterred" });
    const token = generateAdminToken({ id: admin._id.toString() }, "7d");
    res.send({
      id: admin._id,
      username: admin.username,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "first_name last_name username picture email gender bYear bMonth bDay verified isBlocked"
    );
    res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.isBlocked) {
      await user.updateOne({ $set: { isBlocked: false } });
    } else {
      await user.updateOne({ $set: { isBlocked: true } });
    }
    res.status(200).json({ user, response: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const userPosts = await Post.find({ user: req.params.id })
      .populate("user", "first_name gender last_name picture username cover")
      .populate("comments.commentBy", "first_name last_name picture username");
    res.status(200).json(userPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.deletePost = async (req, res) => {
  try {
    const deletePost = await Post.findByIdAndRemove(req.params.id);
    res.status(200).json(deletePost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.deleteComment = async (req, res) => {
  const { commentId } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, {
      $pull: {
        comments: { _id: commentId },
      },
    });
    res.json(post);
  } catch (error) {
    console.log(error);
  }
};

// exports.getReportPost = async (req, res) => {
//   const reports = await Post.find()
//     .populate("reports.reportedBy", "first_name last_name picture")
//     .select("reports");

//   const out = reports.filter((report) => report.reports.length > 0);
//   res.json(out);
// };

exports.getReportPost = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("post")
      .populate("reportedBy", "first_name last_name");
    const a = reports.map(async (report) => {
      return await report.populate("post.user", "first_name last_name picture");
    });
    Promise.all(a).then((resp) => {
      res.json(resp);
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.reportPost = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.body.postId);
    await Report.deleteMany({ post: req.body.postId });
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error.message);
  }
};
