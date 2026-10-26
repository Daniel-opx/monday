const express = require('express');
const db = require('../db/pool');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register — [YOUR AUTH EXERCISE]
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  // 1. Check if email exists in `users`
  // 2. Hash password with bcrypt.hash(password, 10)
  // 3. INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email
  // 4. Sign and return a JWT
  return res.status(501).json({
    message: 'Implement POST /api/auth/register in server/routes/auth.js!',
    received: { name, email },
  });
});

// POST /api/auth/login — [YOUR AUTH EXERCISE]
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  // 1. SELECT * FROM users WHERE email = $1
  // 2. Verify with bcrypt.compare(password, user.password_hash)
  // 3. Sign and return JWT + user object
  return res.status(501).json({
    message: 'Implement POST /api/auth/login in server/routes/auth.js!',
    received: { email },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: rows[0] });
});

module.exports = router;
