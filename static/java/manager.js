// Settings menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const settingsButton = document.getElementById('settingsButton');
    const settingsMenu = document.getElementById('settingsMenu');

    settingsButton.addEventListener('click', function(event) {
        event.preventDefault();
        // Toggle the display property of the settings menu
        if (settingsMenu.style.display === 'none' || settingsMenu.style.display === '') {
            settingsMenu.style.display = 'block';
        } else {
            settingsMenu.style.display = 'none';
        }
    });

    // Optionally, add click events for each of the settings options
    document.querySelector('.open-till').addEventListener('click', function() {
        alert('Open Till clicked');
    });

    document.querySelector('.close-till').addEventListener('click', function() {
        alert('Close Till clicked');
    });

    document.querySelector('.logout').addEventListener('click', function() {
        alert('Logout clicked');
    });
});

// Passcode Change Modal Handling
const modal = document.getElementById("changePasscodeModal");
const changePasscodeButton = document.getElementById("changePasscodeButton");
const closeModal = document.getElementsByClassName("close")[0];

changePasscodeButton.onclick = function() {
    modal.style.display = "block";
};

closeModal.onclick = function() {
    modal.style.display = "none";
};

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Passcode Change Form Submission
document.getElementById('changePasscodeForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const oldPasscode = document.getElementById('old_passcode').value;
    const newPasscode = document.getElementById('new_passcode').value;

    const response = await fetch('/change_passcode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ old_passcode: oldPasscode, new_passcode: newPasscode })
    });

    const data = await response.json();

    if (data.success) {
        // Show success modal
        const successModal = document.getElementById('successModal');
        successModal.style.display = 'block';

        // Close the passcode change modal
        modal.style.display = 'none';

        // Auto-close the success modal after 2 seconds
        setTimeout(() => {
            successModal.style.display = 'none';
        }, 2000);
    } else {
        // Show error modal
        const errorModal = document.getElementById('errorModal');
        document.getElementById('errorMessage').innerText = data.message; // Set the error message
        errorModal.style.display = 'block'; // Show the error modal

        // Close the passcode change modal
        modal.style.display = 'none';

        // Auto-close the error modal after 2 seconds
        setTimeout(() => {
            errorModal.style.display = 'none';
        }, 2000);
    }
});

// Close success or error modal when the user clicks on the "x"
const closeBtns = document.getElementsByClassName('close');
Array.from(closeBtns).forEach(function(btn) {
    btn.onclick = function() {
        this.closest('.modal').style.display = 'none';
    };
});

// Close the modals when clicking outside
window.onclick = function(event) {
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const changePasscodeModal = document.getElementById('changePasscodeModal');
    if (event.target == successModal || event.target == errorModal || event.target == changePasscodeModal) {
        event.target.style.display = 'none';
    }
};
