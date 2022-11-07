const Conversation = require("../models/conversation");

exports.newConversation = async (req, res) => {
  const { senderId, recieverId } = req.body;
  const newConversation = new Conversation({
    members: [senderId, recieverId],
  });
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const id = req.params.id;
    const conversation = await Conversation.find({
      members: { $in: [id] },
    });
    res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.findConversation = async (req, res) => {
  try {
    const user = req.user.id;
    const reciever = req.params.id;
    const conversation = await Conversation.findOne({
      members: { $all: [user, reciever] },
    });
    res.json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
