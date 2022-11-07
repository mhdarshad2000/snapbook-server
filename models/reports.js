const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const reportSchema = mongoose.Schema({
  post: {
    type: ObjectId,
    ref: "Post",
  },
  comment: {
    type: ObjectId,
    ref: "Post.comments",
  },
  reason: {
    type: String,
  },
  reportedBy: {
    type: ObjectId,
    ref: "User",
  },
  visited: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Report", reportSchema);
