const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

exports.authentication = (req, res, next) => {
  const token = req.query.token || req.cookies.token || req.params.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "You don't have a token. Please sign in to continue." });
  }

  if (!secretKey) {
    return res.status(500).json({ success: false, message: "JWT Secret key is not configured." });
  }

  try {
    const data = jwt.verify(token, secretKey);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token. Please sign in again." });
  }
}