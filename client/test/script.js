// client/script.js

// Function to display messages
const displayMessage = (message, isError = false) => {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
        messageDiv.style.color = isError ? '#721c24' : '#155724';
    }
};

// URL for API calls
const API_BASE_URL = 'http://localhost:5000/api';

// --- Authentication check on pages that need it ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const authRequiredPages = [
        'student-details-form.html',
        'student-fees.html',
        'admin-dashboard.html'
    ];
    const currentPage = window.location.pathname.split('/').pop();

    if (!token && authRequiredPages.includes(currentPage)) {
        window.location.href = './login.html';
    }
});

// --- Signup Page Logic (signup.html) ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });
            const data = await response.json();

            if (response.ok) {
                displayMessage(`Signup successful! Redirecting to login...`);
                console.log('Signup Response:', data);
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 2000);
            } else {
                displayMessage(`Error: ${data.message || 'Something went wrong'}`, true);
            }
        } catch (error) {
            displayMessage('Network error. Is the backend server running?', true);
            console.error('Network error:', error);
        }
    });
}

// --- Login Page Logic (login.html) ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.status === 404) {
                displayMessage('Account not found. Please sign up first.');
                return;
            }

            if (response.status === 401) {
                displayMessage('Session expired. Please log in again.', true);
                localStorage.removeItem('token');
                localStorage.removeItem('name');
                window.location.href = './login.html';
                return;
            }

            if (response.ok) {
                displayMessage(`Login successful! Welcome, ${data.name}.`);
                localStorage.setItem('token', data.token);
                localStorage.setItem('name', data.name);

                if (data.user && data.user.detailsComplete) {
                    window.location.href = './student-fees.html';
                } else {
                    window.location.href = './student-details-form.html';
                }
            } else {
                displayMessage(`Error: ${data.message || 'Login failed'}`, true);
            }
        } catch (error) {
            displayMessage('Network error. Is the backend server running?', true);
            console.error('Network error:', error);
        }
    });
}

// --- Student Details Form Logic (student-details-form.html) ---
const detailsForm = document.getElementById('details-form');
if (detailsForm) {
    const userName = localStorage.getItem('name');
    if (userName) {
        document.getElementById('name').value = userName;
        document.getElementById('name').readOnly = true;
    }

    detailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const studentDetails = {
            name: document.getElementById('name').value,
            rollNo: document.getElementById('rollNo').value,
            studentId: document.getElementById('studentId').value,
            stream: document.getElementById('stream').value,
            course: document.getElementById('course').value,
            courseTenure: document.getElementById('courseTenure').value,
            contactNo: document.getElementById('contactNo').value,
            additionalEmail: document.getElementById('additionalEmail').value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/students/details`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(studentDetails),
            });
            const data = await response.json();
            if (response.ok) {
                displayMessage('Details updated successfully!');
                setTimeout(() => {
                    window.location.href = './student-fees.html';
                }, 2000);
            } else {
                displayMessage(`Error: ${data.message || 'Update failed'}`, true);
            }
        } catch (error) {
            displayMessage('Network error. Is the backend server running?', true);
            console.error('Network error:', error);
        }
    });
}

// --- Admin Dashboard Logic (admin-dashboard.html) ---
const qrUploadForm = document.getElementById('qr-upload-form');
if (qrUploadForm) {
    const token = localStorage.getItem('token');
    qrUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const fileInput = document.getElementById('qr-code-file');
        formData.append('qrCode', fileInput.files[0]);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/upload-qr`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                displayMessage('QR code uploaded successfully!');
            } else {
                displayMessage(`Error: ${data.message || 'Upload failed'}`, true);
            }
        } catch (error) {
            displayMessage('Network error. Is the backend server running?', true);
            console.error('Network error:', error);
        }
    });
}

// --- Student Fees Logic (student-fees.html) ---
const paymentConfirmForm = document.getElementById('payment-confirm-form');
const qrCodeImg = document.getElementById('qr-code-img');

if (qrCodeImg && paymentConfirmForm) {
    const token = localStorage.getItem('token');
    const fetchQrCode = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/qr-code`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                // API_BASE_URL se root banake QR load karna
                qrCodeImg.src = `${API_BASE_URL.replace('/api', '')}${data.qrCodeUrl}`;
            } else {
                displayMessage('Failed to load QR code.', true);
            }
        } catch (error) {
            displayMessage('Network error. Failed to fetch QR code.', true);
            console.error('Network error:', error);
        }
    };
    fetchQrCode();

    paymentConfirmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const feeData = {
            semester: document.getElementById('semester').value,
            amount: parseFloat(document.getElementById('amount').value),
            transactionId: document.getElementById('transactionId').value,
        };
        try {
            const response = await fetch(`${API_BASE_URL}/students/fees/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(feeData),
            });
            const data = await response.json();
            if (response.ok) {
                displayMessage('Payment confirmed successfully!');
            } else {
                displayMessage(`Error: ${data.message || 'Payment failed'}`, true);
            }
        } catch (error) {
            displayMessage('Network error. Is the backend server running?', true);
            console.error('Network error:', error);
        }
    });
}
