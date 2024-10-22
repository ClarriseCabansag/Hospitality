//settings
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
        // Add logic for opening the till
        alert('Open Till clicked');
    });

    document.querySelector('.close-till').addEventListener('click', function() {
        // Add logic for closing the till
        alert('Close Till clicked');
    });

    document.querySelector('.logout').addEventListener('click', function() {
        // Add logic for logging out
        alert('Logout clicked');
    });
});

 // Modal Handling
        const modal = document.getElementById("changePasscodeModal");
        const changePasscodeButton = document.getElementById("changePasscodeButton");
        const closeModal = document.getElementsByClassName("close")[0];

        changePasscodeButton.onclick = function() {
            modal.style.display = "block";
        }

        closeModal.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }

        // Handle form submission
        document.getElementById("changePasscodeForm").onsubmit = async function(e) {
            e.preventDefault();
            const old_passcode = document.getElementById("old_passcode").value;
            const new_passcode = document.getElementById("new_passcode").value;

            const response = await fetch('/change_passcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ old_passcode, new_passcode })
            });

            const data = await response.json();
            const messageElement = document.getElementById("changePasscodeMessage");
            messageElement.innerText = data.message;

            if (data.success) {
                messageElement.style.color = "green";
                setTimeout(() => modal.style.display = "none", 2000);
            } else {
                messageElement.style.color = "red";
            }
        }