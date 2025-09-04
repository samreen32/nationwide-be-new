const jwt = require('jsonwebtoken');
const secretKey = 'S@mreenisGoodgirl';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided!" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user_id = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token!" });
  }
};

module.exports = authMiddleware;