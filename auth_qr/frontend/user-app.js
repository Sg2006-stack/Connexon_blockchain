const API_BASE = 'http://127.0.0.1:8000';

// DOM Elements
const userRegisterForm = document.getElementById('userRegisterForm');
const qrModal = document.getElementById('qrModal');
const closeModal = document.querySelector('.close-modal');

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
    
    const submitBtn = userRegisterForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
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
                qrDisplay.innerHTML = `
                    <div class="qr-image-container">
                        <img src="${API_BASE}/qr/${data.qr_path.split('/').pop()}" alt="Your QR Code">
                    </div>
                `;
            } else {
                qrDisplay.innerHTML = `
                    <div class="qr-placeholder">
                        <i class="fas fa-qrcode"></i>
                        <p>QR image generation pending</p>
                    </div>
                `;
            }
            
            // Store and display encrypted QR
            document.getElementById('encryptedDataDisplay').value = data.encrypted_qr;
            qrModal.dataset.encryptedQr = data.encrypted_qr;
            qrModal.dataset.qrPath = data.qr_path || '';
            qrModal.classList.remove('hidden');
            
            userRegisterForm.reset();
            showResult('userResult', `
                <i class="fas fa-check-circle"></i> 
                Registration successful! Your User ID: <strong>${data.user_id}</strong>
            `, 'success');
        } else {
            showResult('userResult', `
                <i class="fas fa-exclamation-circle"></i> 
                ${data.detail || 'Registration failed. Please try again.'}
            `, 'error');
        }
    } catch (error) {
        showResult('userResult', `
            <i class="fas fa-exclamation-circle"></i> 
            Connection error. Please make sure the server is running.
        `, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
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
        alert('QR image not available. Please copy the encrypted data instead.');
    }
});

// Copy encrypted data
document.getElementById('copyData').addEventListener('click', () => {
    const encryptedData = document.getElementById('encryptedDataDisplay');
    encryptedData.select();
    navigator.clipboard.writeText(encryptedData.value);
    
    const btn = document.getElementById('copyData');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
        qrModal.classList.add('hidden');
    }
});
