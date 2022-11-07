const express = require("express");
const {
  newConversation,
  getConversation,
  findConversation,
} = require("../controllers/conversation");
const Conversation = require("../models/conversation");

const { authUser } = require("../middlewares/auth");

const router = express.Router();

router.post("/newConversation", newConversation);
router.get("/getConversation/:id", getConversation);
router.get("/findConversation/:id", authUser, findConversation);

module.exports = router;
