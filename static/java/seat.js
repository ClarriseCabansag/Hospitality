document.addEventListener('DOMContentLoaded', function() {

    // Table popup handling
    const tables = document.querySelectorAll('.table');
    const popupContainer = document.getElementById('popupContainer');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    let selectedTable = null;

    tables.forEach(function(table) {
        table.addEventListener('click', function() {
            selectedTable = table; // Store the clicked table button
            popupContainer.style.display = 'flex'; // Show the popup
        });
    });

    saveButton.addEventListener('click', function() {
        if (selectedTable) {
            selectedTable.style.backgroundColor = '#da7d76'; // Highlight the table in red
            popupContainer.style.display = 'none'; // Hide the popup
        } else {
            console.log("No table selected"); // Debugging line
        }
    });

    cancelButton.addEventListener('click', function() {
        popupContainer.style.display = 'none'; // Hide the popup
    });

    // Handle other popup and button functionalities if needed
    const popup = document.getElementById('popup');
    const openTillAmount = document.getElementById('openTillAmount');

    document.getElementById('btnNo').addEventListener('click', function() {
        popup.style.display = 'none';
    });

    document.getElementById('btnYes').addEventListener('click', function() {
        popup.style.display = 'none';
        openTillAmount.style.display = 'block'; // Show the "Open Till Amount" container
    });

    // Function to open the drawer and display the main content
    document.querySelector('.btn-open-drawer').addEventListener('click', function() {
        // Hide the Open Till container
        document.getElementById('openTillAmount').style.display = 'none';

        // Display the main content container
        document.querySelector('main-content').style.display = 'block';
    });

    function loadContent(page) {
        fetch('/load-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page: page }),
        })
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
        })
        .catch(error => console.error('Error loading content:', error));
    }
    
});

