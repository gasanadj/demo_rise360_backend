const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const verify = require("./verifyRoute");

router.post("/add", upload.single("image"), verify, async (req, res) => {
  const user = await User.findById(req.user.user.id).select("-password");
  const result = await cloudinary.uploader.upload(req.file.path);

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    user: user.id,
    name: user.name,
    Image: result.secure_url,
    cloudinary_id: result.public_id,
  });

  try {
    const savedProduct = await product.save();
    res.status(201).json({ Message: "Product Created Successfully" });
  } catch (error) {
    res.status(500).json({ Message: error });
  }
});

module.exports = router;
