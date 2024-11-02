document.addEventListener('DOMContentLoaded', function() {

    const tables = document.querySelectorAll('.table');
    const popupContainer = document.getElementById('popupContainer');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const guestCountInput = document.getElementById('guestCount');
    let selectedTable = null;

    // Check if table is occupied
    function isTableOccupied(table) {
        return table.classList.contains('occupied');
    }

function showConfirmationPopup(table) {
    const confirmationPopup = document.createElement('div');
    confirmationPopup.className = 'confirmation-popup'; // Add class for styling
    confirmationPopup.innerHTML = `
        <p>This table is occupied. Make it available again?</p>
        <button id="confirmYes">Yes</button>
        <button id="confirmNo">No</button>
    `;

    // Position the pop-up below the selected table and center it
    const rect = table.getBoundingClientRect();
    confirmationPopup.style.position = 'absolute';
    confirmationPopup.style.top = `${rect.bottom + window.scrollY + 10}px`; // Position below the table
    confirmationPopup.style.left = `${rect.left + rect.width / 2}px`; // Center horizontally with respect to the table
    confirmationPopup.style.transform = 'translateX(-50%)'; // Adjust position to be centered
    document.body.appendChild(confirmationPopup);

    // Add event listeners to the buttons
    document.getElementById('confirmYes').addEventListener('click', function() {
        table.classList.remove('occupied'); // Mark table as available
        table.style.backgroundColor = ''; // Reset table color
        showPopupMessage("Table is now available.");
        confirmationPopup.remove(); // Remove confirmation pop-up
    });

    document.getElementById('confirmNo').addEventListener('click', function() {
        confirmationPopup.remove(); // Remove confirmation pop-up
    });
}


    // Function to validate guest count input
    function validateGuestCount() {
        if (guestCountInput.value < 1) {
            showPopupMessage("Please enter a valid guest count between 1 and 15.");
            guestCountInput.value = 1;
        } else if (guestCountInput.value > 15) {
            showPopupMessage("Please enter a valid guest count between 1 and 15.");
            guestCountInput.value = 15;
        }
    }

    tables.forEach(function(table) {
        table.addEventListener('click', function() {
            selectedTable = table;

            if (isTableOccupied(selectedTable)) {
                // Show custom confirmation pop-up below the table
                showConfirmationPopup(selectedTable);
            } else {
                popupContainer.style.display = 'flex'; // Show the guest count popup
                guestCountInput.value = ''; // Reset input field
            }
        });
    });

    saveButton.addEventListener('click', function() {
        if (selectedTable) {
            selectedTable.style.backgroundColor = '#da7d76'; // Highlight the table in red
            selectedTable.classList.add('occupied'); // Mark table as occupied
            popupContainer.style.display = 'none'; // Hide the popup
            guestCountInput.value = ''; // Clear input for next use
            showPopupMessage(`Table reserved for ${guestCountInput.value} guests.`);
        } else {
            alert("Please select a table first.");
        }
    });

    cancelButton.addEventListener('click', function() {
        popupContainer.style.display = 'none'; // Hide the popup
        guestCountInput.value = ''; // Clear input for next use
    });

    // Function to create and display a pop-up message
    function showPopupMessage(message) {
        const popup = document.createElement('div');
        popup.className = 'popup-message'; // Add class for styling
        popup.innerText = message;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }

    // Add validation to guest count input on input and change
    guestCountInput.addEventListener('input', validateGuestCount);
    guestCountInput.addEventListener('change', validateGuestCount);

    // Close popup when clicking outside it
    window.addEventListener('click', function(event) {
        if (event.target === popupContainer) {
            popupContainer.style.display = 'none';
        }
    });

    // Handling secondary popup and drawer functionalities
    const popup = document.getElementById('popup');
    const openTillAmount = document.getElementById('openTillAmount');

    document.getElementById('btnNo').addEventListener('click', function() {
        popup.style.display = 'none';
    });

    document.getElementById('btnYes').addEventListener('click', function() {
        popup.style.display = 'none';
        openTillAmount.style.display = 'block'; // Show the "Open Till Amount" container
    });

    // Open drawer and display main content
    document.querySelector('.btn-open-drawer').addEventListener('click', function() {
        openTillAmount.style.display = 'none';
        document.querySelector('.main-content').style.display = 'block'; // Ensure 'main-content' exists in HTML
    });

    // Load content dynamically
    function loadContent(page) {
        fetch('/load-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page: page }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('content').innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading content:', error);
            showPopupMessage('Failed to load content. Please try again.');
        });
    }
});
