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

    // Show modal with "Mark as Available", "Kitchen Receipt", and "Cancel" buttons (as a popup)
   // Show modal with "Proceed to Payment", "Kitchen Receipt", and "Cancel" buttons (as a popup)
function showOccupiedTableModal(table) {
    const occupiedModal = document.createElement('div');
    occupiedModal.className = 'occupied-popup';
    occupiedModal.innerHTML = `
        <div class="occupied-popup-content">
            <p>This table is occupied. What would you like to do?</p>
            <button id="proceedToPayment">Proceed to Payment</button>
            <button id="kitchenReceipt">Kitchen Receipt</button>
            <button id="cancelAction">Cancel</button>
        </div>
    `;

    // Append the modal to the body
    document.body.appendChild(occupiedModal);

    // "Proceed to Payment" button action
    document.getElementById('proceedToPayment').addEventListener('click', function () {
        proceedToPayment(table);
        occupiedModal.remove();
    });

    // Kitchen Receipt button action
    document.getElementById('kitchenReceipt').addEventListener('click', function () {
        showKitchenReceipt(table);
        occupiedModal.remove();
    });

    // Cancel button action (close the modal)
    document.getElementById('cancelAction').addEventListener('click', function () {
        occupiedModal.remove();
    });

    // Close the modal if user clicks outside of it
    occupiedModal.addEventListener('click', function (event) {
        if (event.target === occupiedModal) {
            occupiedModal.remove();
        }
    });
}

// Redirect to payment page
function proceedToPayment(table) {
    // Pass relevant data about the table to the payment page (e.g., via query parameters or session storage)
    const tableData = {
        tableNumber: table.dataset.tableNumber || 'Unknown',
        guestCount: table.dataset.guestCount || 'N/A',
    };

    // Example: Save data in session storage (optional, for use on the payment page)
    sessionStorage.setItem('paymentTableData', JSON.stringify(tableData));

    // Redirect to the payment page (replace '/payment.html' with the actual payment page URL)
    window.location.href = '/payment';
}

// Example of fetching session data on the payment page (to be implemented there)
/*
document.addEventListener('DOMContentLoaded', function () {
    const tableData = JSON.parse(sessionStorage.getItem('paymentTableData'));
    if (tableData) {
        console.log('Table Data:', tableData);
        // Populate payment page fields with the data if needed
    }
});
*/

// Existing functions...
// Function to show the kitchen receipt (unchanged)
function showKitchenReceipt(table) {
    const receiptPopup = document.createElement('div');
    receiptPopup.className = 'receipt-popup';

    const receiptData = {
        restaurantName: 'PASSENGER SEAT FOOD PLACE',
        address: 'UNIT 308-309 3RD FLOOR SM CITY SAN MATEO',
        location: '#95 GENERAL LUNA STREET AMPID SAN MATEO RIZAL',
        tin: '123-456-789',
        tableNumber: table.dataset.tableNumber || 'Unknown',
        guestCount: table.dataset.guestCount || 'N/A',
        serverName: 'John Doe',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        orderDetails: [
            { qty: 2, description: 'FLIGHT 001', amount: 399 },
            { qty: 1, description: 'MANILA', amount: 685 },
            { qty: 3, description: 'CEBU', amount: 165 }
        ]
    };

    const orderDetailsHtml = receiptData.orderDetails.map(order => `
        <tr>
            <td>${order.qty}</td>
            <td>${order.description}</td>
            <td>$${order.amount.toFixed(2)}</td>
        </tr>
    `).join('');

    const subtotal = receiptData.orderDetails.reduce((sum, order) => sum + order.amount, 0);

    receiptPopup.innerHTML = `
        <div class="receipt-header">
            <h2>${receiptData.restaurantName}</h2>
            <p>${receiptData.address}</p>
            <p>${receiptData.location}</p>
            <p>VAT Registered TIN: ${receiptData.tin}</p>
        </div>
        <div class="receipt-body">
            <p>Table Number: ${receiptData.tableNumber}</p>
            <p>Guest Count: ${receiptData.guestCount}</p>
            <p>Server Name: ${receiptData.serverName}</p>
            <p>Date of Order: ${receiptData.date}</p>
            <p>Time of Order: ${receiptData.time}</p>
            <table class="order-details">
                <thead>
                    <tr>
                        <th>Qty</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetailsHtml}
                </tbody>
            </table>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Total Number of Items: ${receiptData.orderDetails.length}</p>
        </div>
        <button id="closeReceipt">Close</button>
    `;

    document.body.appendChild(receiptPopup);

    document.getElementById('closeReceipt').addEventListener('click', function () {
        receiptPopup.remove();
    });
}


    // Show a popup message
    function showPopupMessage(message) {
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.innerText = message;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }

    tables.forEach(function(table) {
        table.addEventListener('click', function() {
            selectedTable = table;

            if (isTableOccupied(selectedTable)) {
                showOccupiedTableModal(selectedTable);
            } else {
                popupContainer.style.display = 'flex';
                guestCountInput.value = '';
            }
        });
    });

    saveButton.addEventListener('click', function () {
        const guestCount = parseInt(guestCountInput.value, 10);

        if (!guestCount || guestCount < 1) {
            showPopupMessage("Please enter a valid guest count (minimum 1) before saving.");
            guestCountInput.value = 1;
            return;
        }

        if (selectedTable) {
            selectedTable.classList.add('occupied');
            popupContainer.style.display = 'none';
            guestCountInput.value = '';
            showPopupMessage(`Table reserved for ${guestCount} guests.`);
        } else {
            alert("Please select a table first.");
        }
    });

    cancelButton.addEventListener('click', function() {
        popupContainer.style.display = 'none';
        guestCountInput.value = '';
    });

    guestCountInput.addEventListener('input', validateGuestCount);
    guestCountInput.addEventListener('change', validateGuestCount);

    window.addEventListener('click', function(event) {
        if (event.target === popupContainer) {
            popupContainer.style.display = 'none';
        }
    });
});