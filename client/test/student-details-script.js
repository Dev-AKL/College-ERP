const detailsForm = document.getElementById('details-form');
const messageDiv = document.getElementById('message');

const API_BASE_URL = 'http://localhost:5000/api/students';

// Function to display messages
const displayMessage = (message, isError = false) => {
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    messageDiv.style.color = isError ? '#721c24' : '#155724';
};

// Handle form submission
detailsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the JWT token from local storage
    const token = localStorage.getItem('token'); 
    if (!token) {
        displayMessage('No token found. Please log in first.', true);
        return;
    }

    // Get form data
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
        const response = await fetch(`${API_BASE_URL}/details`, {
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
            console.log('Details updated:', data);
            // Redirect to the profile page after a brief delay
            setTimeout(() => {
                window.location.href = '/dashboard.html'; // Or whatever your profile page is named
            }, 2000);
        } else {
            displayMessage(`Error: ${data.message}`, true);
        }
    } catch (error) {
        displayMessage('Network error. Is the backend server running?', true);
        console.error('Network error:', error);
    }
});