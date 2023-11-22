const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

require("dotenv").config();
app.use(bodyParser.json());

// Import Routes
const userRoute = require("./routes/user");
const productRoute = require("./routes/products");

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
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

// Middlewares
app.use("/user", userRoute);
app.use("/products", productRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// DB connection

try {
  mongoose.connect(process.env.DB_CONNECTION);
  console.log("DB Connected");
} catch (error) {
  console.log(error);
}
app.listen(3000, () => {
  console.log("Server started");
});
