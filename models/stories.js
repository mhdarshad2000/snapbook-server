const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const storySchema = mongoose.Schema({
  image: {
    type: String,
  },
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
    index: { expires: "1d" },
  },
  viewed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Stories", storySchema);
