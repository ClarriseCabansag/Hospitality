let attempts = 0;
const maxAttempts = 3;
const lockoutDuration = 5 * 60 * 1000;
let lockoutTimeout;

// Add default manager credentials
const defaultManager = {
    username: 'admin',
    passcode: '123456'
};

// Function to pre-fill manager credentials (optional)
function fillDefaultManager() {
    document.getElementById('username').value = defaultManager.username;
    document.getElementById('passcode').value = defaultManager.passcode;
}

// Optional: Uncomment the next line if you want to auto-fill credentials
// document.addEventListener('DOMContentLoaded', fillDefaultManager);

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Check lockout first
    if (lockoutTimeout) {
        const timeRemaining = lockoutTimeout - Date.now();
        const minutes = Math.floor((timeRemaining / 1000) / 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        const formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        document.getElementById('lockout-message').innerText = `Please wait ${formattedTime} before trying again.`;
        document.getElementById('lockout-message').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';
        return;
    }

    const username = document.getElementById('username').value;
    const passcode = document.getElementById('passcode').value;

    // Input validation
    if (passcode.trim() === '') {
        document.getElementById('error-message').innerText = 'Passcode is required.';
        return;
    }

    if (passcode.length > 10) {
        document.getElementById('error-message').innerText = 'Passcode must not exceed 10 digits.';
        return;
    }

    if (!/^\d+$/.test(passcode)) {
        document.getElementById('error-message').innerText = 'Passcode should only contain numbers.';
        return;
    }

    // Check for default manager credentials first
    if (username === defaultManager.username && passcode === defaultManager.passcode) {
        // Redirect directly to manager dashboard
        window.location.href = '/managers';
        return;
    }

    // Regular login process for other users
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, passcode })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw data;
            });
        }
        return response.json();
    })
    .then(data => {
        // Store the token if provided
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        // Prioritize manager role
        if (data.role === 'manager') {
            window.location.href = '/managers';
        } else if (data.role === 'cashier') {
            window.location.href = '/sales_order';
        }

        // Reset attempts on successful login
        attempts = 0;
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('lockout-message').style.display = 'none';
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('error-message').innerText = error.message || 'Invalid credentials';
        document.getElementById('username').value = '';
        document.getElementById('passcode').value = '';

        attempts++;
        handleFailedAttempt();
    });
});

// Handle failed login attempts
function handleFailedAttempt() {
    if (attempts >= maxAttempts) {
        document.getElementById('lockout-message').innerText = 'Too many failed attempts. Please wait 5 minutes.';
        document.getElementById('lockout-message').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';

        lockoutTimeout = Date.now() + lockoutDuration;

        const countdownInterval = setInterval(() => {
            const timeRemaining = lockoutTimeout - Date.now();
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                attempts = 0;
                lockoutTimeout = null;
                document.getElementById('lockout-message').style.display = 'none';
            } else {
                const minutes = Math.floor((timeRemaining / 1000) / 60);
                const seconds = Math.floor((timeRemaining / 1000) % 60);
                document.getElementById('lockout-message').innerText =
                    `Please wait ${minutes}:${seconds < 10 ? '0' + seconds : seconds} before trying again.`;
            }
        }, 1000);
    }
}

// Toggle passcode visibility
const togglePasscode = document.getElementById('toggle-passcode');
const passcodeInput = document.getElementById('passcode');

togglePasscode.addEventListener('click', function() {
    const isPassword = passcodeInput.type === 'password';
    passcodeInput.type = isPassword ? 'text' : 'password';
    togglePasscode.textContent = isPassword ? '🙈' : '👁️';
});