const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const admins = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10) }, // Example admin
];

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = admins.find(a => a.username === username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};