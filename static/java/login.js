let attempts = 0; // Initialize attempts
const maxAttempts = 3; // Maximum number of attempts
const lockoutDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
let lockoutTimeout;

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Check if user is currently locked out
    if (lockoutTimeout) {
        const timeRemaining = lockoutTimeout - Date.now();
        const minutes = Math.floor((timeRemaining / 1000) / 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        const formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        document.getElementById('lockout-message').innerText = `Please wait ${formattedTime} before trying again.`;
        document.getElementById('lockout-message').style.display = 'block';
        document.getElementById('error-message').style.display = 'none'; // Hide invalid credentials message during lockout
        return;
    }

    const username = document.getElementById('username').value;
    const passcode = document.getElementById('passcode').value;

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
                document.getElementById('error-message').innerText = data.message;
                document.getElementById('username').value = '';
                document.getElementById('passcode').value = '';
                attempts++;

                // Check if maximum attempts reached
                if (attempts >= maxAttempts) {
                    document.getElementById('lockout-message').innerText = 'Too many failed attempts. Please wait for 5 minutes before trying again.';
                    document.getElementById('lockout-message').style.display = 'block';
                    document.getElementById('error-message').style.display = 'none'; // Hide error message during lockout

                    // Set lockout timeout
                    lockoutTimeout = Date.now() + lockoutDuration;

                    // Start countdown
                    const countdownInterval = setInterval(() => {
                        const timeRemaining = lockoutTimeout - Date.now();
                        const minutes = Math.floor((timeRemaining / 1000) / 60);
                        const seconds = Math.floor((timeRemaining / 1000) % 60);
                        const formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

                        if (timeRemaining <= 0) {
                            clearInterval(countdownInterval);
                            attempts = 0; // Reset attempts after lockout
                            lockoutTimeout = null; // Reset lockout timeout
                            document.getElementById('lockout-message').style.display = 'none'; // Hide lockout message
                        } else {
                            document.getElementById('lockout-message').innerText = `Please wait ${formattedTime} before trying again.`;
                        }
                    }, 1000);
                }
            });
        }

        return response.json().then(data => {
            const role = data.role;
            if (role === 'manager') {
                window.location.href = '/managers';
            } else if (role === 'cashier') {
                window.location.href = '/sales_order';
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('error-message').innerText = 'An error occurred. Please try again.';
    });
});

// Add toggle functionality for passcode visibility
const togglePasscode = document.getElementById('toggle-passcode');
const passcodeInput = document.getElementById('passcode');

togglePasscode.addEventListener('click', function() {
    if (passcodeInput.type === 'password') {
        passcodeInput.type = 'text'; // Change to text to show passcode
        togglePasscode.textContent = '🙈'; // Change icon to indicate "hide"
    } else {
        passcodeInput.type = 'password'; // Change back to password
        togglePasscode.textContent = '👁️'; // Change icon to indicate "show"
    }
});