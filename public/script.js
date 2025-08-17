// Global variables
let currentButtonType = '';
let currentSubButton = '';
let charts = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    
    // Set default date filters to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
});

// Show greed subsection
function showGreedSection() {
    document.querySelector('.reflection-section:first-of-type').style.display = 'none';
    document.getElementById('greedSection').style.display = 'block';
    
    // Smooth scroll to greed section
    document.getElementById('greedSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Hide greed subsection
function hideGreedSection() {
    document.getElementById('greedSection').style.display = 'none';
    document.querySelector('.reflection-section:first-of-type').style.display = 'block';
    
    // Smooth scroll back to main section
    document.querySelector('.reflection-section:first-of-type').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Show input modal
function showInputModal(buttonType, subButton = null) {
    currentButtonType = buttonType;
    currentSubButton = subButton;
    
    const modal = document.getElementById('inputModal');
    const modalTitle = document.getElementById('modalTitle');
    const reflectionText = document.getElementById('reflectionText');
    
    // Set modal title
    if (subButton) {
        modalTitle.textContent = `${buttonType} - ${subButton}`;
    } else {
        modalTitle.textContent = buttonType;
    }
    
    // Clear previous text and focus
    reflectionText.value = '';
    modal.style.display = 'block';
    
    // Focus on textarea after modal animation
    setTimeout(() => {
        reflectionText.focus();
    }, 100);
    
    // Add touch event to prevent background scroll on iOS
    modal.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('inputModal');
    modal.style.display = 'none';
    currentButtonType = '';
    currentSubButton = '';
}

// Save reflection
async function saveReflection() {
    const content = document.getElementById('reflectionText').value.trim();
    
    if (!content) {
        alert('請輸入反省內容');
        return;
    }
    
    try {
        const response = await fetch('/api/reflection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                buttonType: currentButtonType,
                subButton: currentSubButton,
                content: content
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            
            // Show success feedback
            showToast('反省已保存');
            
            // Reload statistics
            loadStatistics();
            
            // If details are shown, reload them
            if (document.getElementById('detailsContent').style.display !== 'none') {
                loadDetails();
            }
        } else {
            alert('保存失敗: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving reflection:', error);
        alert('保存失敗，請檢查網絡連接');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        z-index: 2000;
        font-size: 1rem;
        backdrop-filter: blur(10px);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Load statistics and create chart
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const result = await response.json();
        
        if (result.success) {
            createChart(result.data);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Create individual charts for each button type
function createChart(data) {
    console.log('Creating charts with data:', data);
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
    
    // Button types and their colors
    const buttonTypes = [
        { name: '嗔', color: '#4ecdc4', isGreed: false },
        { name: '痴', color: '#45b7d1', isGreed: false },
        { name: '妒', color: '#f093fb', isGreed: false },
        { name: '慢', color: '#4facfe', isGreed: false },
        { name: '疑', color: '#43e97b', isGreed: false },
        { name: '財', color: '#667eea', isGreed: true },
        { name: '色', color: '#764ba2', isGreed: true },
        { name: '名', color: '#96c93d', isGreed: true },
        { name: '食', color: '#f5576c', isGreed: true },
        { name: '睡', color: '#00f2fe', isGreed: true }
    ];
    
    // Get last 30 days for better mobile display
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
    }
    
    const dateLabels = dates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    // Create chart for each button type
    buttonTypes.forEach(buttonType => {
        const canvasId = `chart-${buttonType.name}`;
        const canvas = document.getElementById(canvasId);
        
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Get data for this button type
        const buttonData = dates.map(date => {
            // Convert API date format to match our date format
            const dayData = data.filter(d => {
                const apiDate = d.hk_date.split('T')[0]; // Convert '2025-08-17T00:00:00.000Z' to '2025-08-17'
                return apiDate === date;
            });
            
            let count = 0;
            if (buttonType.isGreed) {
                count = dayData.filter(d => d.button_type === '貪' && d.sub_button === buttonType.name)
                             .reduce((sum, d) => sum + parseInt(d.count), 0);
            } else {
                count = dayData.filter(d => d.button_type === buttonType.name && !d.sub_button)
                             .reduce((sum, d) => sum + parseInt(d.count), 0);
            }
            return count;
        });
        
        console.log(`Data for ${buttonType.name}:`, buttonData);
        const hasData = buttonData.some(count => count > 0);
        console.log(`${buttonType.name} has data:`, hasData);
        
        // Create chart
        charts[buttonType.name] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dateLabels,
                datasets: [{
                    label: buttonType.name,
                    data: buttonData,
                    backgroundColor: buttonType.color,
                    borderColor: buttonType.color,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const date = dates[context[0].dataIndex];
                                return new Date(date).toLocaleDateString('zh-HK');
                            },
                            label: function(context) {
                                return `${buttonType.name}: ${context.parsed.y} 次`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            },
                            maxRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            },
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    });
}

// Show details section
function showDetails() {
    const detailsContent = document.getElementById('detailsContent');
    if (detailsContent.style.display === 'none' || !detailsContent.style.display) {
        detailsContent.style.display = 'block';
        loadDetails();
        
        // Smooth scroll to details
        setTimeout(() => {
            detailsContent.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    } else {
        detailsContent.style.display = 'none';
    }
}

// Load detailed records
async function loadDetails() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const buttonType = document.getElementById('buttonFilter').value;
    const subButton = document.getElementById('subButtonFilter').value;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (buttonType) params.append('buttonType', buttonType);
    if (subButton) params.append('subButton', subButton);
    
    try {
        const response = await fetch(`/api/details?${params}`);
        const result = await response.json();
        
        if (result.success) {
            displayDetailsTable(result.data);
        }
    } catch (error) {
        console.error('Error loading details:', error);
    }
}

// Display details in table
function displayDetailsTable(data) {
    const tbody = document.getElementById('detailsTableBody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #6b7280;">沒有找到記錄</td></tr>';
        return;
    }
    
    data.forEach(record => {
        const row = document.createElement('tr');
        const date = new Date(record.hk_date).toLocaleDateString('zh-HK');
        const type = record.button_type;
        const subType = record.sub_button || '-';
        const content = record.content || '-';
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${type}</td>
            <td>${subType}</td>
            <td style="max-width: 200px; word-wrap: break-word;">${content}</td>
        `;
        tbody.appendChild(row);
    });
}

// Apply filters
function applyFilters() {
    loadDetails();
}

// Handle modal close on background click
document.getElementById('inputModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Handle enter key in textarea (with shift for new line)
document.getElementById('reflectionText').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveReflection();
    }
});

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        Object.values(charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }, 500);
});