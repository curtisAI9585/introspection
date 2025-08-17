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
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/reflection_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database
async function initDB() {
  try {
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
    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Helper function to get Hong Kong date
function getHKDate() {
  return moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD');
}

// API Routes
app.post('/api/reflection', async (req, res) => {
  try {
    const { buttonType, subButton, content } = req.body;
    const hkDate = getHKDate();
    
    const result = await pool.query(
      'INSERT INTO reflections (button_type, sub_button, content, date, hk_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [buttonType, subButton || null, content, new Date(), hkDate]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error saving reflection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get statistics for charts
app.get('/api/statistics', async (req, res) => {
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get detailed records
app.get('/api/details', async (req, res) => {
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});