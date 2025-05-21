// Add this to your existing api/index.js
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ 
      success: true,
      token,
      message: 'Login successful'
    });
  } else {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid password'
    });
  }
});