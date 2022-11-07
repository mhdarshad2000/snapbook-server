const express = require("express");
const { newMessage, getMessage } = require("../controllers/message");

const router = express.Router();
router.post("/newMessage", newMessage);
router.get("/getMessage/:id", getMessage);

module.exports = router;
