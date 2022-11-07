const Post = require("../models/posts");
const User = require("../models/user");
const Report = require("../models/reports");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate(
      "user",
      "first_name last_name gender picture cover username"
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const friendsTemp = await User.findById(req.user.id).select("friends");
    const friends = friendsTemp.friends;
    const promises = friends.map((user) => {
      return Post.find({ user: user })
        .populate("user", "first_name gender last_name picture username cover")
        .populate("comments.commentBy", "first_name last_name picture username")
        .sort({ createdAt: -1 })
        .limit(10);
    });
    const friendsPosts = await (await Promise.all(promises)).flat();
    const userPosts = await Post.find({ user: req.user.id })
      .populate("user", "first_name gender last_name picture username cover")
      .populate("comments.commentBy", "first_name last_name picture username")
      .sort({ createdAt: -1 })
      .limit(10);
    friendsPosts.push(...[...userPosts]);
    friendsPosts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    res.json(friendsPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;
    let newComment = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      {
        new: true,
      }
    ).populate("comments.commentBy", "picture first_name last_name user");
    res.json(newComment.comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);
    const check = user?.savedPosts.find(
      (post) => post.post.toString() == postId
    );
    if (check) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savedPosts: {
            _id: check._id,
          },
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
    return res.status(200).json({ message: "Saved succesfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const report = await new Report({
      post: req.params.id,
      reason: req.body.item,
      reportedBy: req.user.id,
    }).save();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.body.postId, {
      $pull: { comments: { _id: req.params.id } },
    });
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.reportComment = async (req, res) => {
  try {
    const report = await new Report({
      comment: req.params.id,
      reason: req.body.item,
      reportedBy: req.user.id,
    }).save;
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.savedPosts = async (req, res) => {
  try {
    const savedPost = await User.findById(req.user.id)
      .select("savedPosts")
      .populate("savedPosts.post");
    const saved = savedPost.savedPosts.map(async (saved) => {
      return await saved.post.populate(
        "user",
        "picture username first_name last_name"
      );
    });
    Promise.all(saved).then((resp) => res.json(resp));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
