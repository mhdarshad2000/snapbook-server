const express = require("express");
const { postStory, getStories,getMyStory } = require("../controllers/story");
const { authUser } = require("../middlewares/auth");

const router = express.Router();

router.post("/updateStory", authUser, postStory);

router.get("/getStories", authUser, getStories);
router.get("/getMyStory",authUser,getMyStory)

module.exports = router;
