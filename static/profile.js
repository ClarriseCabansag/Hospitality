let currentRow = null; // To keep track of the row being edited

// Function to show the form
function showForm() {
    const popup = document.getElementById('form-popup');
    const formTitle = document.getElementById('form-title');
    const createBtn = document.getElementById('create-btn');

    if (popup) {
        if (currentRow) {
            formTitle.textContent = 'Edit Cashier Account';
            createBtn.textContent = 'Update';
        } else {
            formTitle.textContent = 'Create Cashier Account';
            createBtn.textContent = 'Create';
        }
        popup.style.display = 'flex'; // Show the modal as a centered overlay
    }
}

// Function to hide the modal
function hideForm() {
    const popup = document.getElementById('form-popup');
    if (popup) {
        popup.style.display = 'none';
    }
    clearForm(); // Clear the form fields when hiding
    currentRow = null; // Reset the currentRow
}

// Function to show notifications (success or error)
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    notificationMessage.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('visible');
    notification.style.display = 'block';

    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
        notification.classList.add('hidden');

        setTimeout(() => {
            notification.style.display = 'none';
        }, 300); // Match transition
    }, 3000);
}

// Function to show a custom confirmation dialog
function showConfirmation(message, onConfirm) {
    const confirmationBox = document.getElementById('confirmation');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmButton = document.getElementById('confirm-btn');
    const cancelButton = document.getElementById('cancel-btn');

    confirmationMessage.textContent = message;
    confirmationBox.classList.remove('hidden');
    confirmationBox.classList.add('visible');
    confirmationBox.style.display = 'block';

    // Handle confirm button click
    confirmButton.onclick = function () {
        onConfirm(); // Call the onConfirm function passed as argument
        hideConfirmation();
    };

    // Handle cancel button click
    cancelButton.onclick = function () {
        hideConfirmation();
    };
}

// Function to hide the custom confirmation dialog
function hideConfirmation() {
    const confirmationBox = document.getElementById('confirmation');
    confirmationBox.classList.remove('visible');
    confirmationBox.classList.add('hidden');

    setTimeout(() => {
        confirmationBox.style.display = 'none';
    }, 300); // Match transition
}

// Function to handle cashier creation or update
function createOrUpdateCashier() {
    const name = document.getElementById('firstName').value; // Use 'name' for both first and last name
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value;
    const passcode = document.getElementById('passcode').value;

    const url = currentRow ? `/edit_cashier/${currentRow.getAttribute('data-id')}` : '/create_cashier';
    const method = currentRow ? 'PUT' : 'POST';

    // Validate input fields
    if (!name || !lastName || !username || !passcode) {
        alert("Please fill in all fields");
        return;
    }

    // Send data to backend via fetch API
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name, // Send 'name' for the first name field
            last_name: lastName, // Send 'last_name' for the last name field
            username: username,
            passcode: passcode
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(currentRow ? 'Cashier updated successfully!' : 'Cashier created successfully!');

            if (currentRow) {
                // Update the existing row in the table
                currentRow.cells[0].textContent = data.cashier.name;
                currentRow.cells[1].textContent = data.cashier.last_name;
                currentRow.cells[2].textContent = data.cashier.username;
                currentRow.cells[3].textContent = passcode;  // Display the passcode
            } else {
                // Add a new row to the table
                const table = document.getElementById('cashierTable');
                const newRow = table.insertRow();  // Insert a new row at the end of the table
                newRow.setAttribute('data-id', data.cashier.id);  // Set the cashier ID as data attribute

                newRow.innerHTML = `
                    <td>${data.cashier.name}</td>
                    <td>${data.cashier.last_name}</td>
                    <td>${data.cashier.username}</td>
                    <td>${passcode}</td>
                    <td>${data.cashier.date_created}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editRow(this)">✏️</button>
                        <button class="action-btn delete-btn" onclick="deleteRow(this)">🗑️</button>
                    </td>
                `;
            }

            // Hide the form after adding or updating cashier
            hideForm();
        } else {
            alert(data.message || 'Error saving cashier');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error communicating with the server');
    });
}

// Function to clear the form fields
function clearForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('username').value = '';
    document.getElementById('passcode').value = '';
    currentRow = null;  // Reset current row after clearing form
}


// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchCashiers);

function fetchCashiers() {
    fetch('/get_cashiers') // Endpoint to fetch cashiers
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('cashierTable');
            tableBody.innerHTML = ''; // Clear the table before populating

            data.cashiers.forEach(cashier => {
                const row = tableBody.insertRow(); // Insert a new row
                row.setAttribute('data-id', cashier.id); // Set cashier ID

                row.innerHTML = `
                    <td>${cashier.name}</td>
                    <td>${cashier.last_name}</td>
                    <td>${cashier.username}</td>
                    <td>${cashier.date_created}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editRow(this)">✏️</button>
                        <button class="action-btn delete-btn" onclick="deleteRow(this)">🗑️</button>
                    </td>
                `;
            });
        })
        .catch(error => {
            console.error('Error fetching cashiers:', error);
        });
}

// Function to handle the update operation
function updateCashier(cashierId) {
    const updatedData = {
        name: document.getElementById('editName').value,
        last_name: document.getElementById('editLastName').value,
        username: document.getElementById('editUsername').value,
        passcode: document.getElementById('editPasscode').value,
    };

    fetch(`/update_cashier/${cashierId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        alert('Cashier updated successfully!');
        fetchCashiers(); // Refresh the cashier list after update
    })
    .catch(error => {
        console.error('Error updating cashier:', error);
    });
}

function editRow(button) {
    currentRow = button.closest('tr'); // Get the closest table row
    const cells = currentRow.getElementsByTagName('td');

    // Populate the form with current data
    document.getElementById('firstName').value = cells[0].textContent;
    document.getElementById('lastName').value = cells[1].textContent;
    document.getElementById('username').value = cells[2].textContent;

    // Passcode is stored as a data attribute on the row for security
    const passcode = currentRow.getAttribute('data-passcode');
    document.getElementById('passcode').value = passcode || ''; // Default to empty if not available

    showForm(); // Show the form for editing
}



// Function to delete a cashier row with custom confirmation
function deleteRow(button) {
    const row = button.closest('tr');
    const cashierId = row.getAttribute('data-id');

    // Show custom confirmation
    showConfirmation("Are you sure you want to delete this cashier?", function() {
        // If confirmed, send delete request
        fetch(`/delete_cashier/${cashierId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                row.remove(); // Remove row from table
                showNotification('Cashier deleted successfully');
            } else {
                showNotification(data.message || 'Error deleting cashier');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error deleting cashier');
        });
    });
}
// Validate name fields to accept only alphabetic characters
function validateName(input) {
    const regex = /^[A-Za-z\s]*$/;
    if (!regex.test(input.value)) {
        alert('Please enter only alphabetic characters for the name.');
        input.value = input.value.replace(/[^A-Za-z\s]/g, '');
    }
}

// Validate passcode to accept only numeric values
function validatePasscode(input) {
    const regex = /^\d*$/;
    if (!regex.test(input.value)) {
        alert('Please enter only numeric values for the passcode.');
        input.value = input.value.replace(/\D/g, '');
    }
}