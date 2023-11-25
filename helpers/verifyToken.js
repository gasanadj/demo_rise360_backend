const jwt = require("jsonwebtoken");

const { TOKEN_SECRET } = process.env;

function verifySocketToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      resolve(null);
    } else {
      try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        resolve(decoded);
      } catch (error) {
        if (error.name === "JsonWebTokenError") {
          reject(new Error("Invalid token"));
        } else if (error.name === "TokenExpiredError") {
          reject(new Error("Token expired"));
        } else {
          reject(new Error("Token verification failed"));
        }
      }
    }
  });
}

module.exports = verifySocketToken;
