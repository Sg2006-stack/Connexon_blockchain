const API_BASE = 'http://127.0.0.1:8000';

// State
let adminToken = localStorage.getItem('adminToken') || null;
let verifyCount = parseInt(localStorage.getItem('verifyCount')) || 0;
let sessionStartTime = null;
let sessionTimer = null;

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const adminStatus = document.getElementById('adminStatus');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminRegisterForm = document.getElementById('adminRegisterForm');
const verifyQRForm = document.getElementById('verifyQRForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (adminToken) {
        showDashboard();
    } else {
        showAuth();
    }
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab + 'Tab';
        document.getElementById(tabId).classList.add('active');
    });
});

// Show result message
function showResult(elementId, message, type) {
    const resultBox = document.getElementById(elementId);
    resultBox.className = `result-box ${type}`;
    resultBox.innerHTML = message;
    resultBox.classList.remove('hidden');
}

// Show Authentication Section
function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    adminStatus.classList.add('hidden');
    stopSessionTimer();
}

// Show Dashboard
function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    adminStatus.classList.remove('hidden');
    document.getElementById('verifyCount').textContent = verifyCount;
    startSessionTimer();
}

// Session Timer
function startSessionTimer() {
    sessionStartTime = Date.now();
    sessionTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('sessionTime').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopSessionTimer() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
}

// Admin Login
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    const formData = {
        username: document.getElementById('loginUsername').value,
        password: document.getElementById('loginPassword').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            adminToken = data.access_token;
            localStorage.setItem('adminToken', adminToken);
            showResult('loginResult', `
                <i class="fas fa-check-circle"></i> 
                Login successful! Redirecting to dashboard...
            `, 'success');
            
            setTimeout(() => {
                adminLoginForm.reset();
                document.getElementById('loginResult').classList.add('hidden');
                showDashboard();
            }, 1000);
        } else {
            showResult('loginResult', `
                <i class="fas fa-exclamation-circle"></i> 
                ${data.detail || 'Invalid credentials'}
            `, 'error');
        }
    } catch (error) {
        showResult('loginResult', `
            <i class="fas fa-exclamation-circle"></i> 
            Connection error. Please make sure the server is running.
        `, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Admin Registration
adminRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = adminRegisterForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;
    
    const formData = {
        username: document.getElementById('adminUsername').value,
        email: document.getElementById('adminEmail').value,
        password: document.getElementById('adminPassword').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showResult('registerResult', `
                <i class="fas fa-check-circle"></i> 
                ${data.message} You can now login.
            `, 'success');
            adminRegisterForm.reset();
            
            // Switch to login tab after 2 seconds
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 2000);
        } else {
            showResult('registerResult', `
                <i class="fas fa-exclamation-circle"></i> 
                ${data.detail || 'Registration failed'}
            `, 'error');
        }
    } catch (error) {
        showResult('registerResult', `
            <i class="fas fa-exclamation-circle"></i> 
            Connection error. Please make sure the server is running.
        `, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// QR Verification
verifyQRForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = verifyQRForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    submitBtn.disabled = true;
    
    const encryptedQR = document.getElementById('encryptedQR').value;
    
    try {
        const response = await fetch(`${API_BASE}/admin/verify-qr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ encrypted_qr: encryptedQR })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update verify count
            verifyCount++;
            localStorage.setItem('verifyCount', verifyCount);
            document.getElementById('verifyCount').textContent = verifyCount;
            
            // Display user data
            const userData = data.user_data;
            const userDetails = document.getElementById('userDetails');
            userDetails.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-user"></i> Name</span>
                    <span class="detail-value">${userData.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-envelope"></i> Email</span>
                    <span class="detail-value">${userData.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-phone"></i> Phone</span>
                    <span class="detail-value">${userData.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-id-card"></i> Voter ID</span>
                    <span class="detail-value">${userData.voter_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"><i class="fas fa-credit-card"></i> PAN ID</span>
                    <span class="detail-value">${userData.pan_id}</span>
                </div>
            `;
            
            document.getElementById('verifiedUserSection').classList.remove('hidden');
            showResult('verifyResult', `
                <i class="fas fa-check-circle"></i> 
                Identity verified successfully!
            `, 'success');
        } else {
            document.getElementById('verifiedUserSection').classList.add('hidden');
            
            if (response.status === 401) {
                adminToken = null;
                localStorage.removeItem('adminToken');
                showResult('verifyResult', `
                    <i class="fas fa-exclamation-circle"></i> 
                    Session expired. Please login again.
                `, 'error');
                setTimeout(() => showAuth(), 2000);
            } else {
                showResult('verifyResult', `
                    <i class="fas fa-exclamation-circle"></i> 
                    ${data.detail || 'Verification failed'}
                `, 'error');
            }
        }
    } catch (error) {
        showResult('verifyResult', `
            <i class="fas fa-exclamation-circle"></i> 
            Connection error. Please make sure the server is running.
        `, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    adminToken = null;
    localStorage.removeItem('adminToken');
    verifyCount = 0;
    localStorage.removeItem('verifyCount');
    document.getElementById('verifiedUserSection').classList.add('hidden');
    document.getElementById('verifyResult').classList.add('hidden');
    document.getElementById('encryptedQR').value = '';
    showAuth();
});
