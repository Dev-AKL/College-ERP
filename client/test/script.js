const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

const API_BASE_URL = 'http://localhost:5000/api/auth';

// Function to display messages
const displayMessage = (message, isError = false) => {
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    messageDiv.style.color = isError ? '#721c24' : '#155724';
};

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();
        if (response.ok) {
            displayMessage(`Signup successful! Welcome, ${data.name}.`);
            console.log('Signup Response:', data);
        } else {
            displayMessage(`Error: ${data.message}`, true);
        }
    } catch (error) {
        displayMessage('Network error. Is the backend server running?', true);
        console.error('Network error:', error);
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            displayMessage(`Login successful! Welcome, ${data.name}.`);
            console.log('Login Response:', data);

            // Automatically store the new token and user's name
            localStorage.setItem('token', data.token);
            localStorage.setItem('name', data.name);
            
            // Redirect to the student details form page
            window.location.href = './student-details-form.html';

        } else {
            displayMessage(`Error: ${data.message}`, true);
        }
    } catch (error) {
        displayMessage('Network error. Is the backend server running?', true);
        console.error('Network error:', error);
    }
});