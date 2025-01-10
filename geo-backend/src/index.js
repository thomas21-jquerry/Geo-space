const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes'); // Import the file upload routes

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', (req, res) => {
  res.send('GeoBackend API is working');
});

// Use the fileRoutes for handling file upload
app.use('/api/files', fileRoutes); // Handles the file upload API

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
