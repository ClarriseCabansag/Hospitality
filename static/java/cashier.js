document.addEventListener('DOMContentLoaded', function() {
    const settingsButton = document.getElementById('settingsButton');
    const settingsMenu = document.getElementById('settingsMenu');
    const openTillButton = document.querySelector('.open-till');  // Open Till button
    const openTillContainer = document.getElementById('openTillAmount');  // Open Till container

    // Toggle settings menu
    settingsButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (settingsMenu.style.display === 'none' || settingsMenu.style.display === '') {
            settingsMenu.style.display = 'block';
        } else {
            settingsMenu.style.display = 'none';
        }
    });

    // Show the Open Till container when the Open Till button is clicked
    openTillButton.addEventListener('click', function() {
        // Show the open till container and hide the settings menu
        openTillContainer.style.display = 'block';
        settingsMenu.style.display = 'none';  // Close settings menu
    });

    // Optionally, you can add logic for closing the open till container if needed
    // Example for hiding the open till container when the "Close Till" option is clicked:
    document.querySelector('.close-till').addEventListener('click', function() {
        openTillContainer.style.display = 'none';  // Hide open till container
    });

    // Add logic for keypad buttons (optional)
    const keypadButtons = document.querySelectorAll('.keypad button');
    const tillAmountDisplay = document.querySelector('.till-amount-display');

    keypadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = button.textContent;

            if (buttonText === '.' && tillAmountDisplay.value.includes('.')) {
                return; // Prevent adding more than one dot
            }
            if (buttonText === '←') {
                tillAmountDisplay.value = tillAmountDisplay.value.slice(0, -1);  // Remove last character
            } else {
                tillAmountDisplay.value += buttonText;  // Add number or dot to the display
            }
        });
    });
});
