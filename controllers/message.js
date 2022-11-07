const Message = require("../models/messages");

exports.newMessage = async (req, res) => {
  try {
    const newMessage = await new Message(req.body);
    const saveMessage = await newMessage.save();
    res.status(200).json(saveMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
