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