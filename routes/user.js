const express = require("express");
const { postStory } = require("../controllers/story");
const {
  register,
  activateAccount,
  login,
  sendVerification,
  auth,
  getProfile,
  updateProfilePicture,
  updateCoverPicture,
  addFriend,
  cancelRequests,
  acceptRequset,
  unFriend,
  deleteRequest,
  updateDetails,
  search,
  addToSearchHistory,
  getSearchHistory,
  getUser,
  getFriends,
  getFriendsPageInfos,
  friendSuggestions,
} = require("../controllers/user");
const { authUser } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/activate", authUser, activateAccount);
router.post("/login", login);
router.post("/sendVerification", authUser, sendVerification);
router.get("/getProfile/:username", authUser, getProfile);
router.put("/updateProfilePicture", authUser, updateProfilePicture);
router.put("/updateCoverPicture", authUser, updateCoverPicture);
router.put("/addFriend/:id", authUser, addFriend);
router.put("/cancelRequests/:id", authUser, cancelRequests);
router.put("/acceptRequset/:id", authUser, acceptRequset);
router.put("/unFriend/:id", authUser, unFriend);
router.put("/deleteRequest/:id", authUser, deleteRequest);
router.put("/updateDetails", authUser, updateDetails);
router.post("/search/:searchTerm", authUser, search);
router.put("/addToSearchHistory", authUser, addToSearchHistory);
router.get("/getSearchHistory", authUser, getSearchHistory);
router.get("/getUser/:id", authUser, getUser);
router.get("/getFriends", authUser, getFriends);
router.get("/getFriendsPageInfos", authUser, getFriendsPageInfos);
router.get("/friendSuggestions", authUser, friendSuggestions);

module.exports = router;
