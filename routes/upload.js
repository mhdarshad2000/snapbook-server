const express = require("express");
const { uploadImages, listImages } = require("../controllers/upload");
const imageUploader = require("../middlewares/imageUploader");
const { authUser } = require("../middlewares/auth");

const router = express.Router();

router.post("/uploadImages", authUser, imageUploader, uploadImages);
router.post("/listImages",authUser,listImages)

module.exports = router;
