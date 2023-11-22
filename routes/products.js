const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const verify = require("./verifyRoute");

/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Adding a new product
 *     tags: [Products]
 *     description: Creates a Product
 *     parameters:
 *       - name: auth-token
 *         description: Your auth-token
 *         in: header
 *         type: string
 *         required: true
 *     requestBody:
 *       description: Provide Product details
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product Created Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.post("/add", upload.single("image"), verify, async (req, res) => {
  const user = await User.findById(req.user.user.id).select("-password");
  const result = await cloudinary.uploader.upload(req.file?.path);

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    user: user.id,
    seller: user.name,
    phone: user.phone,
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

/**
 * @swagger
 * /products:
 *  get:
 *    summary: Getting all Products
 *    tags: [Products]
 *    description: Returns all products
 *    responses:
 *     200:
 *       description: These are all the products available on the blog
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     400:
 *       description: Bad Request
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     500:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     401:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     404:
 *       description: Not Found
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 */
router.get("/", async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.status(200).json({ Message: allProducts });
  } catch (error) {
    res.status(400).json({ Message: error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *  delete:
 *    summary: Deleting a specific product
 *    tags: [Product]
 *    description: Deletes a specific product
 *    parameters:
 *      - name: id
 *        description: Id of the product needed
 *        in: path
 *        required: true
 *      - name: auth-token
 *        description: Your auth-token
 *        in: header
 *        type: string
 *        required: true
 *    responses:
 *     200:
 *       description: Product deleted
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     400:
 *       description: Bad Request
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     500:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     401:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *     404:
 *       description: Not Found
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 */

router.delete("/delete/:id", verify, async (req, res) => {
  try {
    const deletedPost = await Product.remove({ _id: req.params.id });
    res.status(200).json({ Message: "Product Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ Message: error });
  }
});

module.exports = router;
