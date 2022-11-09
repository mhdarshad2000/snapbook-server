const cloudinary = require("cloudinary");
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.uploadImages = async (req, res) => {
  try {
    const { path } = req.body;
    const files = Object?.values(req.files).flat();
    let images = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file, path);
      images.push(url);
      removeTmp(file.tempFilePath);
    }
    res.json(images);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.listImages = async (req, res) => {
  try {
    const { path, sort, max } = req.body;
    cloudinary.v2.search
      .expression(path)
      .sort_by("public_id", `${sort}`)
      .max_results(max)
      .execute()
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        console.log(err.error.message);
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadToCloudinary = async (file, path) => {
  try {
    return new Promise((resolve) => {
      cloudinary.v2.uploader.upload(
        file.tempFilePath,
        {
          folder: path,
        },
        (err, res) => {
          if (err) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({ message: "Upload image failed." });
          }
          resolve({
            url: res.secure_url,
          });
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};
