document.addEventListener('DOMContentLoaded', function () {
    const tables = document.querySelectorAll('.table');
    const popupContainer = document.getElementById('popupContainer');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const guestCountInput = document.getElementById('guestCount');
    let selectedTable = null;

    // Load table statuses from localStorage
    function loadTableStatusFromLocalStorage() {
        const tableStatuses = JSON.parse(localStorage.getItem('tableStatuses')) || {};
        console.log("Loaded table statuses:", tableStatuses); // Debugging log

        tables.forEach(table => {
            const tableId = table.getAttribute('data-label');
            if (tableStatuses[tableId]) {
                table.classList.add('occupied');
            } else {
                table.classList.remove('occupied');
            }
        });
    }

    // Save table status to localStorage
    function saveTableStatusToLocalStorage() {
        const tableStatuses = {};
        tables.forEach(table => {
            tableStatuses[table.getAttribute('data-label')] = table.classList.contains('occupied');
        });
        console.log("Saving table statuses:", tableStatuses); // Debugging log
        localStorage.setItem('tableStatuses', JSON.stringify(tableStatuses));
    }

    // Check if table is occupied
    function isTableOccupied(table) {
        return table.classList.contains('occupied');
    }

    // Show modal for occupied tables
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

        document.body.appendChild(occupiedModal);

        document.getElementById('proceedToPayment').addEventListener('click', function () {
            proceedToPayment(table);
            occupiedModal.remove();
        });

        document.getElementById('kitchenReceipt').addEventListener('click', function () {
            showKitchenReceipt(table);
            occupiedModal.remove();
        });

        document.getElementById('cancelAction').addEventListener('click', function () {
            occupiedModal.remove();
        });

        occupiedModal.addEventListener('click', function (event) {
            if (event.target === occupiedModal) {
                occupiedModal.remove();
            }
        });
    }

    // Redirect to payment page
    function proceedToPayment(table) {
        const tableData = {
            tableNumber: table.getAttribute('data-label') || 'Unknown',
            guestCount: table.dataset.guestCount || 'N/A',
        };
        sessionStorage.setItem('paymentTableData', JSON.stringify(tableData));
        window.location.href = '/payment';
    }

    // Show the kitchen receipt
    function showKitchenReceipt(table) {
        const receiptPopup = document.createElement('div');
        receiptPopup.className = 'receipt-popup';

        const receiptData = {
            restaurantName: 'PASSENGER SEAT FOOD PLACE',
            address: 'UNIT 308-309 3RD FLOOR SM CITY SAN MATEO',
            location: '#95 GENERAL LUNA STREET AMPID SAN MATEO RIZAL',
            tin: '123-456-789',
            tableNumber: table.getAttribute('data-label') || 'Unknown',
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

    // Mark table as available
    function markTableAvailable(tableId) {
        fetch('/mark_table_available', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_id: tableId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tableElement = document.querySelector(`[data-label="${tableId}"]`);
                    if (tableElement) {
                        tableElement.classList.remove('occupied');
                        saveTableStatusToLocalStorage();
                        console.log(`Table ${tableId} is now available.`);
                    }
                } else {
                    console.error(`Failed to update table: ${data.error}`);
                }
            })
            .catch(error => console.error('Error updating table:', error));
    }

    // Handle payment completion
 // Handle payment completion
function handlePaymentCompletion() {
    const paymentData = JSON.parse(sessionStorage.getItem('paymentTableData'));
    if (paymentData && paymentData.tableNumber) {
        const tableId = paymentData.tableNumber;
        // Mark the table as available in the UI
        const tableElement = document.querySelector(`[data-label="${tableId}"]`);
        if (tableElement) {
            tableElement.classList.remove('occupied');  // Remove the occupied class
            saveTableStatusToLocalStorage();  // Save the updated table statuses to localStorage
            console.log(`Table ${tableId} is now available after payment.`);
        }
    } else {
        console.warn('No payment data found in sessionStorage.');
    }
}


    // Event Listeners
    tables.forEach(function (table) {
        table.addEventListener('click', function () {
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
            alert("Please enter a valid guest count.");
            return;
        }

        if (selectedTable) {
            const tableId = selectedTable.getAttribute('data-label');
            fetch('/save_table_reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table_id: tableId, guest_count: guestCount })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        selectedTable.classList.add('occupied');
                        popupContainer.style.display = 'none';
                        saveTableStatusToLocalStorage(); // Ensure we save status after reservation
                    } else {
                        alert(data.error);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    });

    cancelButton.addEventListener('click', function () {
        popupContainer.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === popupContainer) {
            popupContainer.style.display = 'none';
        }
    });

    // Load table statuses and handle payment completion on page load
    loadTableStatusFromLocalStorage(); // Make sure table statuses load when the page loads
    handlePaymentCompletion();
});
