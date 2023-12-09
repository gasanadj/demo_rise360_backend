const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require("cors");
const nodemailer = require("nodemailer");
const chatRoute = express.Router();

require("dotenv").config();
app.use(
  cors({
    origin: ["*"],
  })
);
app.use(bodyParser.json());
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

// Import Routes
const userRoute = require("./routes/user");
const productRoute = require("./routes/products");
const getChat = require("./routes/chat");
chatRoute.get("/", getChat.getChat);
app.get("/", (req, res) => {
  res.send("Yes! Still Working");
});

// Swagger Documentation

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "RiseFarmer360",
      version: "1.0.0",
      description: "This is where you interact with our agricultural API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          name: "auth-token",
          in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:3000/",
      },
      {
        url: "https://risefarmer360.onrender.com",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

// Middlewares
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/products", productRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Nodemailer codes
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "capstoneweb@outlook.com",
    pass: "Capstoneemailtest@123",
  },
});

// Checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart, userEmail } = req.body;

    // Ensure the cart is not empty before creating a checkout session
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const lineItems = cart.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });

    // send confirmation email

    res.status(200).json({ url: session.url });
    await sendConfirmationEmail(userEmail, lineItems);
  } catch (e) {
    console.error("Error creating checkout session:", e.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

async function sendConfirmationEmail(userEmail, lineItems) {
  const formattedLineItems = `
    <table style="border-collapse: collapse; width: 100%;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Product</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Quantity</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
              item.price_data.product_data.name
            }</td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
              item.quantity
            }</td>
            <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">$${(
              item.price_data.unit_amount / 100
            ).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
  const mailOptions = {
    from: "capstoneweb@outlook.com",
    to: userEmail,
    subject: "Order Confirmation",
    html: `
    <p>Thank you for shopping with RiseFarmer360! You have contributed to the development of a Farmer and the improvement in the agricultural sector.Your payment was successful.</p>
    <p><strong>Order Details:</strong></p>
    ${formattedLineItems}
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).json(error);
    } else {
      console.log("email sent" + info);
      res.status(200).json("success");
    }
  });
}

// DB connection

try {
  mongoose.connect(process.env.DB_CONNECTION).then(() => {
    console.log("Database connected");
  });
} catch (error) {
  console.log(error);
}

module.exports = app;
