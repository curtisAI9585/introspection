// Authentication helper
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Authenticated fetch helper
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    };
    
    return fetch(url, { ...defaultOptions, ...options });
}

// Load random percepts
async function loadPercepts() {
    try {
        const response = await authenticatedFetch('/api/percepts/random');
        const data = await response.json();
        
        if (data.success) {
            displayPercepts(data.data);
        } else {
            throw new Error(data.error || '載入失敗');
        }
    } catch (error) {
        console.error('Error loading percepts:', error);
        document.getElementById('loadingMessage').textContent = '載入失敗，請重試';
    }
}

// Display percepts
function displayPercepts(percepts) {
    const container = document.getElementById('perceptContainer');
    const loading = document.getElementById('loadingMessage');
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (percepts && percepts.length === 3) {
        percepts.forEach((percept, index) => {
            const element = document.getElementById(`percept${index + 1}`);
            element.textContent = percept.percept;
        });
        
        loading.style.display = 'none';
        container.style.display = 'block';
        refreshBtn.style.display = 'block';
    } else {
        loading.textContent = '無法載入金句，請重試';
    }
}

// Load new percepts
function loadNewPercepts() {
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('loadingMessage').textContent = '正在載入金句...';
    document.getElementById('perceptContainer').style.display = 'none';
    document.getElementById('refreshBtn').style.display = 'none';
    
    loadPercepts();
}

// Go back to main page
function goBack() {
    window.location.href = '/app';
}

// Check authentication on page load
window.addEventListener('DOMContentLoaded', function() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    loadPercepts();
});