
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        age: document.getElementById('age').value,
        country: document.getElementById('country').value,
        gender: document.getElementById('gender').value
    };
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

    if (response.ok) {
        window.location.href = '/login';
    } else {
        const data = await response.json();
        alert(data.message);
    }} catch (error) {
        console.error('Error:', error);
    }
});