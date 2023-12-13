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
 *               price:
 *                 type: string
 *               category:
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
    price: req.body.price,
    category: req.body.category,
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
 *       description: These are all the products available on the site
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
 *    tags: [Products]
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
    const deletedPost = await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ Message: "Product Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ Message: error });
  }
});

/**
 * @swagger
 * /products/{postId}:
 *   get:
 *     summary: Retrieve a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to be retrieved
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               Message: Product retrieved successfully
 *               product: { _id: '...', name: '...', description: '...', price: ..., category: '...', image: '...', cloudinary_id: '...' }
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/:postId", verify, async (req, res) => {
  try {
    const product = await Product.findById(req.params.postId);
    res
      .status(200)
      .json({ Message: "Product retrieved Successfully", product: product });
  } catch (err) {
    res.json({ Message: err });
  }
});

/**
 * @swagger
 * /products/update/{productId}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to be updated
 *       - in: formData
 *         name: name
 *         type: string
 *         description: New name for the product
 *       - in: formData
 *         name: description
 *         type: string
 *         description: New description for the product
 *       - in: formData
 *         name: price
 *         type: number
 *         description: New price for the product
 *       - in: formData
 *         name: category
 *         type: string
 *         description: New category for the product
 *       - in: formData
 *         name: image
 *         type: file
 *         description: New image for the product
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             example:
 *               Message: Product updated successfully
 *               updatedProduct: { _id: '...', name: '...', description: '...', price: ..., category: '...', image: '...', cloudinary_id: '...' }
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */

router.put(
  "/update/:productId",
  upload.single("image"),
  verify,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.user.id).select("-password");
      const product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({ Message: "Product not found" });
      }

      if (product.user.toString() !== user.id) {
        return res
          .status(403)
          .json({ Message: "Unauthorized to update this product" });
      }

      const updateFields = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
      };
      const updatedProduct = await Product.updateOne(
        { _id: req.params.productId },
        updateFields
      );

      res
        .status(200)
        .json({ Message: "Product updated successfully", updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ Message: "Internal Server Error" });
    }
  }
);

module.exports = router;
