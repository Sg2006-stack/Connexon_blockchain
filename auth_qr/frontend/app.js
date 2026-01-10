const API_BASE = 'http://127.0.0.1:8000';

// Store admin token
let adminToken = localStorage.getItem('adminToken') || null;

// DOM Elements
const userRegisterForm = document.getElementById('userRegisterForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminRegisterForm = document.getElementById('adminRegisterForm');
const verifyQRForm = document.getElementById('verifyQRForm');
const qrModal = document.getElementById('qrModal');
const closeModal = document.querySelector('.close-modal');

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show corresponding content
        const tabId = btn.dataset.tab;
        if (tabId === 'register') {
            document.getElementById('register-admin').classList.add('active');
        } else {
            document.getElementById(tabId).classList.add('active');
        }
        
        // Check login status for verify tab
        if (tabId === 'verify') {
            updateVerifyTabStatus();
        }
    });
});

// Update verify tab based on login status
function updateVerifyTabStatus() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const verifyForm = document.getElementById('verifyQRForm');
    
    if (adminToken) {
        notLoggedIn.classList.add('hidden');
        verifyForm.classList.remove('hidden');
    } else {
        notLoggedIn.classList.remove('hidden');
        verifyForm.classList.add('hidden');
    }
}

// Show result message
function showResult(elementId, message, type) {
    const resultBox = document.getElementById(elementId);
    resultBox.className = `result-box ${type}`;
    resultBox.innerHTML = message;
    resultBox.classList.remove('hidden');
}

// User Registration
userRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        voter_id: document.getElementById('voter_id').value,
        pan_id: document.getElementById('pan_id').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show QR modal
            const qrDisplay = document.getElementById('qrDisplay');
            if (data.qr_path) {
                qrDisplay.innerHTML = `<img src="${API_BASE}/qr/${data.qr_path.split('/').pop()}" alt="Your QR Code">`;
            } else {
                qrDisplay.innerHTML = `<p style="color: var(--warning);">QR image not available. Save your encrypted data:</p>
                    <textarea readonly style="width:100%; height:80px; margin-top:10px; background:rgba(0,0,0,0.3); color:white; border:1px solid var(--primary); border-radius:5px; padding:10px;">${data.encrypted_qr}</textarea>`;
            }
            
            // Store encrypted QR for download
            qrModal.dataset.encryptedQr = data.encrypted_qr;
            qrModal.classList.remove('hidden');
            
            userRegisterForm.reset();
            showResult('userResult', `<i class="fas fa-check-circle"></i> Registration successful! User ID: ${data.user_id}`, 'success');
        } else {
            showResult('userResult', `<i class="fas fa-exclamation-circle"></i> ${data.detail || 'Registration failed'}`, 'error');
        }
    } catch (error) {
        showResult('userResult', `<i class="fas fa-exclamation-circle"></i> Connection error. Make sure the server is running.`, 'error');
    }
});

// Admin Login
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
            showResult('loginResult', `<i class="fas fa-check-circle"></i> Login successful! You can now verify QR codes.`, 'success');
            adminLoginForm.reset();
            updateVerifyTabStatus();
        } else {
            showResult('loginResult', `<i class="fas fa-exclamation-circle"></i> ${data.detail || 'Login failed'}`, 'error');
        }
    } catch (error) {
        showResult('loginResult', `<i class="fas fa-exclamation-circle"></i> Connection error. Make sure the server is running.`, 'error');
    }
});

// Admin Registration
adminRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
            showResult('adminRegisterResult', `<i class="fas fa-check-circle"></i> ${data.message}. You can now login.`, 'success');
            adminRegisterForm.reset();
        } else {
            showResult('adminRegisterResult', `<i class="fas fa-exclamation-circle"></i> ${data.detail || 'Registration failed'}`, 'error');
        }
    } catch (error) {
        showResult('adminRegisterResult', `<i class="fas fa-exclamation-circle"></i> Connection error. Make sure the server is running.`, 'error');
    }
});

// QR Verification
verifyQRForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
            const userData = data.user_data;
            showResult('verifyResult', `
                <div class="user-data">
                    <h4><i class="fas fa-user-check"></i> Identity Verified - ${data.status}</h4>
                    <p><strong>Name:</strong> ${userData.name}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Phone:</strong> ${userData.phone}</p>
                    <p><strong>Voter ID:</strong> ${userData.voter_id}</p>
                    <p><strong>PAN ID:</strong> ${userData.pan_id}</p>
                </div>
            `, 'success');
        } else {
            if (response.status === 401) {
                adminToken = null;
                localStorage.removeItem('adminToken');
                updateVerifyTabStatus();
                showResult('verifyResult', `<i class="fas fa-exclamation-circle"></i> Session expired. Please login again.`, 'error');
            } else {
                showResult('verifyResult', `<i class="fas fa-exclamation-circle"></i> ${data.detail || 'Verification failed'}`, 'error');
            }
        }
    } catch (error) {
        showResult('verifyResult', `<i class="fas fa-exclamation-circle"></i> Connection error. Make sure the server is running.`, 'error');
    }
});

// Close modal
closeModal.addEventListener('click', () => {
    qrModal.classList.add('hidden');
});

// Close modal on outside click
qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
        qrModal.classList.add('hidden');
    }
});

// Download QR Code
document.getElementById('downloadQR').addEventListener('click', () => {
    const qrImage = document.querySelector('#qrDisplay img');
    if (qrImage) {
        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = 'safeher-qr-code.png';
        link.click();
    } else {
        // Copy encrypted QR to clipboard
        const encryptedQr = qrModal.dataset.encryptedQr;
        navigator.clipboard.writeText(encryptedQr);
        alert('Encrypted QR data copied to clipboard!');
    }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Initialize
updateVerifyTabStatus();
