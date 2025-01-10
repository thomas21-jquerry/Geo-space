const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Register User
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (checkUser.rows.length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into the database
  const newUser = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
    [username, email, hashedPassword]
  );

  // Create JWT token
  const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(201).json({ token });
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (user.rows.length === 0) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Create JWT token
  const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
});

module.exports = router;
