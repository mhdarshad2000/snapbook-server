const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const reactSchema = mongoose.Schema({
  react: {
    type: String,
    enum: ["like", "haha", "love", "sad", "angry"],
    required: true,
  },
  postRef: {
    type: ObjectId,
    ref: "Post",
  },
  reactBy: {
    type: ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("React", reactSchema);
