const Stories = require("../models/stories");
const User = require("../models/user");

exports.postStory = async (req, res) => {
  const { url, text } = req.body;
  try {
    const story = await new Stories({
      image: url,
      createdAt: new Date(),
      text: text,
      user: req.user.id,
    }).save();

    res.json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const friends = await User.findById(req.user.id).select("friends");
    const stories = friends.friends.map((friend) => {
      return Stories.find({ user: friend }).populate(
        "user",
        "first_name last_name username picture"
      );
    });
    Promise.all(stories).then((resp) => {
      const userStory = resp.filter((story) => story.length > 0);
      res.json(userStory);
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyStory = async (req, res) => {
  try {
    const stories = await Stories.find({ user: req.user.id }).populate(
      "user",
      "first_name last_name username picture"
    );
    res.json(stories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
