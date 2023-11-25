const router = require("express").Router();
const User = require("../models/User");
const { registrationValidation, loginValidation } = require("./validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * /user/register:
 *  post:
 *    summary: Registering a new user
 *    tags: [Users]
 *    description: Creates a new user
 *    requestBody:
 *      description: Provide User details
 *      content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                role:
 *                  type: string
 *                phone:
 *                  type: string
 *    responses:
 *     201:
 *       description: User Created Successfully
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

router.post("/register", async (req, res) => {
  // Data validation
  const { error } = registrationValidation(req.body);
  if (error) return res.status(400).json({ Message: error.details[0].message });

  // Check if email exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists)
    return res.status(400).json({ Message: "Email already exists" });

  // Password hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: hashedPassword,
    phone: req.body.phone,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json({ Message: "User Created Successfully" });
  } catch (err) {
    res.status(400).json(err);
  }
});

/**
 * @swagger
 * /user/login:
 *  post:
 *    summary: Log in of Users
 *    tags: [Users]
 *    description: Logs a new user
 *    requestBody:
 *      description: Provide Login details
 *      content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *    responses:
 *     200:
 *       description: User Login Successful
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
router.post("/login", async (req, res) => {
  // validate data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ Message: error.details[0].message });
  // Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ Message: "Email does not exist" });
  // check if passwords match
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass)
    return res.status(400).json({ Message: "Password is incorrect" });
  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };
  jwt.sign(payload, process.env.TOKEN_SECRET, (err, token) => {
    if (err) throw err;
    res.json(token);
  });
});

module.exports = router;
