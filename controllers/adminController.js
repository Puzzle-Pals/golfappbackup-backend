const jwt = require('jsonwebtoken');

/**
 * Admin login controller. Compares password to process.env.ADMIN_PASSWORD.
 * Issues JWT token on success.
 */
exports.login = async (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  // You can add more claims if needed
  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

/**
 * Example protected endpoint.
 */
exports.checkAuth = (req, res) => {
  res.json({ success: true, message: 'You are authenticated as admin.' });
};