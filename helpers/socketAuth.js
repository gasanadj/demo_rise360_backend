const User = require("../models/User");
const verifySocketToken = require("./verifyToken");

const socketAuth = async (token) => {
  try {
    if (!token) {
      throw new Error("Aunthentication Error: Token Missing");
    }

    const decode = await verifySocketToken(token);
    if (!decode) {
      throw new Error("Token Error: Invalid Token");
    }
    console.log(decode.user.id);
    const user = await User.findById(decode.user.id);
    console.log(user);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Authentication Error: ", error.message);
  }
};

module.exports = socketAuth;
