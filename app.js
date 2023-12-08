const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cors = require("cors");
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

// Checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

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

    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("Error creating checkout session:", e.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// DB connection

try {
  mongoose.connect(process.env.DB_CONNECTION).then(() => {
    console.log("Database connected");
  });
} catch (error) {
  console.log(error);
}

module.exports = app;
