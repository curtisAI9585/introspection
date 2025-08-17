// Simple test server without database for development
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mock data for testing
let mockData = [];
let idCounter = 1;

// Helper function to get Hong Kong date
function getHKDate() {
    const now = new Date();
    const hkTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8
    return hkTime.toISOString().split('T')[0];
}

// API Routes for testing
app.post('/api/reflection', (req, res) => {
    try {
        const { buttonType, subButton, content } = req.body;
        const hkDate = getHKDate();
        
        const reflection = {
            id: idCounter++,
            button_type: buttonType,
            sub_button: subButton || null,
            content: content,
            hk_date: hkDate,
            timestamp: new Date().toISOString()
        };
        
        mockData.push(reflection);
        console.log('Saved reflection:', reflection);
        
        res.json({ success: true, data: reflection });
    } catch (err) {
        console.error('Error saving reflection:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get statistics for charts
app.get('/api/statistics', (req, res) => {
    try {
        const endDate = getHKDate();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 364);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Group data by date and button type
        const stats = {};
        mockData.forEach(item => {
            if (item.hk_date >= startDateStr && item.hk_date <= endDate) {
                const key = `${item.hk_date}-${item.button_type}-${item.sub_button || ''}`;
                if (!stats[key]) {
                    stats[key] = {
                        hk_date: item.hk_date,
                        button_type: item.button_type,
                        sub_button: item.sub_button,
                        count: 0
                    };
                }
                stats[key].count++;
            }
        });
        
        const result = Object.values(stats);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Error getting statistics:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get detailed records
app.get('/api/details', (req, res) => {
    try {
        const { startDate, endDate, buttonType, subButton } = req.query;
        
        let filteredData = mockData;
        
        if (startDate) {
            filteredData = filteredData.filter(item => item.hk_date >= startDate);
        }
        
        if (endDate) {
            filteredData = filteredData.filter(item => item.hk_date <= endDate);
        }
        
        if (buttonType) {
            filteredData = filteredData.filter(item => item.button_type === buttonType);
        }
        
        if (subButton) {
            filteredData = filteredData.filter(item => item.sub_button === subButton);
        }
        
        // Sort by timestamp descending
        filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({ success: true, data: filteredData });
    } catch (err) {
        console.error('Error getting details:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
    console.log(`Open http://localhost:${port} to view the app`);
    console.log('This is a test server with mock data - no database required');
});