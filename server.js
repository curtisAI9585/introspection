const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment-timezone');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Authentication middleware
function requireAuth(req, res, next) {
  const isAuthenticated = req.headers.authorization === process.env.AUTH_PASSWORD;
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Serve login page for unauthenticated users
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve main app for authenticated users
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Static files
app.use(express.static('public'));

// PostgreSQL connection with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/reflection_db',
  ssl: false  // Zeabur internal network doesn't need SSL
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Not set - this is the problem!' : 'Set');
    return false;
  }
}

// Initialize database
async function initDB() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('CRITICAL: Cannot connect to database. Check your DATABASE_URL environment variable in Zeabur.');
      return false;
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reflections (
        id SERIAL PRIMARY KEY,
        button_type VARCHAR(10) NOT NULL,
        sub_button VARCHAR(10),
        content TEXT,
        date DATE NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        hk_date DATE NOT NULL
      )
    `);
    console.log('Database table created/verified successfully');
    return true;
  } catch (err) {
    console.error('Database initialization error:', err.message);
    return false;
  }
}

// Helper function to get Hong Kong date
function getHKDate() {
  return moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD');
}

// Login API
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.AUTH_PASSWORD;
  
  if (!correctPassword) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: AUTH_PASSWORD not set' 
    });
  }
  
  if (password === correctPassword) {
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Invalid password' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      success: true, 
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
      help: 'Check DATABASE_URL environment variable in Zeabur'
    });
  }
});

// Clear all data endpoint (for testing purposes)
app.post('/api/clear-data', requireAuth, async (req, res) => {
  try {
    const { confirmCode } = req.body;
    
    // Simple security check
    if (confirmCode !== 'CLEAR_ALL_DATA_2025') {
      return res.status(403).json({
        success: false,
        error: 'Invalid confirmation code',
        help: 'Use the correct confirmation code to clear data'
      });
    }
    
    // Get count before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM reflections');
    const recordCount = parseInt(countResult.rows[0].count);
    
    // Clear all data
    await pool.query('DELETE FROM reflections');
    
    // Reset ID sequence
    await pool.query('ALTER SEQUENCE reflections_id_seq RESTART WITH 1');
    
    console.log(`Cleared ${recordCount} reflection records`);
    
    res.json({
      success: true,
      message: `Successfully cleared ${recordCount} records`,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Error clearing data:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API Routes
app.post('/api/reflection', requireAuth, async (req, res) => {
  try {
    console.log('Received reflection data:', req.body);
    
    const { buttonType, subButton, content } = req.body;
    
    if (!buttonType || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: buttonType and content' 
      });
    }
    
    const hkDate = getHKDate();
    console.log('Saving to database with HK date:', hkDate);
    
    const result = await pool.query(
      'INSERT INTO reflections (button_type, sub_button, content, date, hk_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [buttonType, subButton || null, content, new Date(), hkDate]
    );
    
    console.log('Reflection saved successfully:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving reflection:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: 'Database connection or query failed. Check Zeabur PostgreSQL service.',
      help: 'Make sure PostgreSQL service is running and DATABASE_URL is set correctly'
    });
  }
});

// Get statistics for charts
app.get('/api/statistics', requireAuth, async (req, res) => {
  try {
    const endDate = getHKDate();
    const startDate = moment().tz('Asia/Hong_Kong').subtract(364, 'days').format('YYYY-MM-DD');
    
    const result = await pool.query(`
      SELECT 
        hk_date,
        button_type,
        sub_button,
        COUNT(*) as count
      FROM reflections 
      WHERE hk_date >= $1 AND hk_date <= $2
      GROUP BY hk_date, button_type, sub_button
      ORDER BY hk_date
    `, [startDate, endDate]);
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error getting statistics:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      help: 'Database connection issue. Check PostgreSQL service in Zeabur.'
    });
  }
});

// Get detailed records
app.get('/api/details', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, buttonType, subButton } = req.query;
    
    let query = 'SELECT * FROM reflections WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    if (startDate) {
      paramCount++;
      query += ` AND hk_date >= $${paramCount}`;
      params.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ` AND hk_date <= $${paramCount}`;
      params.push(endDate);
    }
    
    if (buttonType) {
      paramCount++;
      query += ` AND button_type = $${paramCount}`;
      params.push(buttonType);
    }
    
    if (subButton) {
      paramCount++;
      query += ` AND sub_button = $${paramCount}`;
      params.push(subButton);
    }
    
    query += ' ORDER BY timestamp DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error getting details:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      help: 'Database connection issue. Check PostgreSQL service in Zeabur.'
    });
  }
});

// This route is already defined above for login page

// Initialize database and start server
console.log('Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

initDB().then((success) => {
  if (success) {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Database connection: OK');
    });
  } else {
    console.error('Failed to initialize database. Server starting anyway for debugging...');
    app.listen(port, () => {
      console.log(`Server running on port ${port} (DATABASE ISSUE - CHECK ZEABUR POSTGRESQL)`);
    });
  }
}).catch((err) => {
  console.error('Critical error during startup:', err);
  app.listen(port, () => {
    console.log(`Server running on port ${port} (ERROR MODE)`);
  });
});