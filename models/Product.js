const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 20,
    max: 100,
    required: true,
  },

  description: {
    type: String,
    min: 0,
    max: 1024,
    required: true,
  },

  user: {
    type: ObjectId,
    ref: "users",
  },

  Image: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
  name: {
    type: String,
  },
});

module.exports = Products = mongoose.model("Products", productSchema);
