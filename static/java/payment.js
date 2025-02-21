document.addEventListener('DOMContentLoaded', function () {
    const cashInput = document.getElementById('cash-input');
    const changeAmount = document.getElementById('change-amount');
    const totalAmountElement = document.querySelector('.total p:nth-child(2)');
    const discountSection = document.querySelector('.discount-section');
    const discountAmountElement = document.getElementById('discount-amount');
    const totalAmountDisplay = document.getElementById('total-amount');
    const confirmPaymentBtn = document.querySelector('.confirm-btn');
    const paymentModal = document.getElementById('paymentModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const applyButton = document.querySelector('.apply-btn');
    const discountButtons = document.querySelectorAll('.discount-summary .tab-btn');
    const addButton = document.querySelector('.add-btn');
    const cashDisplay = document.getElementById('cash-display');
    const cashInputPaymentMethod = document.querySelector('.payment-method .payment-input input');
    const paymentTab = document.getElementById('payment-tab'); // Ensure this tab ID matches your HTML
    const orderTab = document.getElementById('order-tab'); // Ensure this tab ID matches your HTML
    const nameInput = document.querySelector('.discount-summary .input-fields input:nth-child(1)');
    const idInput = document.querySelector('.discount-summary .input-fields input:nth-child(2)');
    let discountApplied = false;
    let discountType = '';
    const seniorDiscount = 0.20; // 20% discount
    const pwdDiscount = 0.20; // 15% discount
    const vatRate = 1.12; // VAT divisor

    // Function to clear the payment fields
    function clearPaymentFields() {
        cashInput.value = '';
        cashDisplay.textContent = '₱0.00';
        cashInputPaymentMethod.value = '';
        changeAmount.textContent = '₱0.00';
        discountSection.style.display = 'none';
        discountAmountElement.textContent = '0%';
        discountType = '';
        discountButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.backgroundColor = '#f1f1f1'; // Default gray
            btn.style.color = 'black';
        });
    }

    // Function to hide payment-related elements
    function hidePaymentFields() {
        const paymentSection = document.querySelector('.payment-section'); // Assuming you have a payment section element
        if (paymentSection) {
            paymentSection.style.display = 'none';
        }
    }

    // Listen for tab switching and handle display of payment fields
    if (paymentTab) {
        paymentTab.addEventListener('click', function () {
            clearPaymentFields(); // Clear the payment fields when the payment tab is selected
            const paymentSection = document.querySelector('.payment-section');
            if (paymentSection) {
                paymentSection.style.display = 'block'; // Show the payment section when payment tab is clicked
            }
        });
    }

    if (orderTab) {
        orderTab.addEventListener('click', function () {
            hidePaymentFields(); // Hide the payment section when switching to order tab
            clearPaymentFields(); // Clear the fields for a fresh start when switching tabs
        });
    }

    // Ensure the DOM elements are present for cash calculation
    if (cashInput && changeAmount && totalAmountElement) {
        cashInput.addEventListener('input', function () {
            const cash = parseFloat(cashInput.value) || 0;
            const totalAmount = parseFloat(totalAmountElement.textContent.replace('₱', '').replace(',', '')) || 0;
            const change = cash - totalAmount;

            // Update the displayed change amount
            changeAmount.textContent = `₱${change.toFixed(2)}`;
        });
    }



// Show Error Modal (Styled Like Image)
function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.classList.add('error-modal');

    const modalContent = `
        <div class="modal-content">
            <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="red" class="error-icon">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="red"></circle>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="red"></line>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="red"></line>
                </svg>
            </div>
            <h3>Invalid!</h3>
            <p>${message}</p>
            <button class="close-btn">Ok</button>
        </div>
    `;
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Close the modal
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', function () {
        modal.remove();
    });

    // Close modal when clicking outside of it
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showSuccessModal(message) {
    const modal = document.createElement('div');
    modal.classList.add('success-modal'); // Custom styling class

    const modalContent = `
        <div class="modal-content">
            <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="green" class="success-icon">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="green"></circle>
                    <path d="M9 12l2 2 4-4" stroke="green" stroke-width="2"></path>
                </svg>
            </div>
            <h3> Cash Applied!</h3>
            <p>${message}</p>
            <button class="close-btn">Ok</button>
        </div>
    `;
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Close the modal
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', function () {
        modal.remove();
    });

    // Close modal when clicking outside of it
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/// Handle Payment Modal
if (confirmPaymentBtn && paymentModal && closeModalButton) {
    function showModal() {
        paymentModal.style.display = 'flex';
    }

    function hideModal() {
        paymentModal.style.display = 'none';
    }

    confirmPaymentBtn.addEventListener('click', function () {
        // Prevent confirmation if the button is still disabled
        if (confirmPaymentBtn.disabled) {
            showErrorModal('Please enter a valid payment before confirming.');
            return;
        }

        // Collect payment data
        const orderId = document.querySelector('.order-id-value').textContent.trim();
        const subtotal = parseFloat(document.querySelector('.subtotal p:nth-child(2)').textContent.replace('₱', '').replace(',', '')) || 0;
        const tax = parseFloat((subtotal * 0.05).toFixed(2));
        const total = parseFloat(totalAmountDisplay.textContent.replace('₱', '').replace(',', '')) || 0;
        const cashReceived = parseFloat(cashDisplay.textContent.replace('₱', '').replace(',', '')) || 0; // Use cash from cashDisplay
        const change = parseFloat(changeAmount.textContent.replace('₱', '').replace(',', '')) || 0;

        // Check if a discount has been applied
        const discountType = document.getElementById('discount-type') ? document.getElementById('discount-type').textContent.trim() : null;
        const discountPercentage = discountApplied ? parseFloat(discountAmountElement.textContent.replace('%', '')) / 100 : null;

        // Validate if change is negative
        if (change < 0) {
            showErrorModal('Payment cannot be confirmed because cash provided is insufficient.');

            // Clear the cash input and cash display for correction
            cashInput.value = '';
            cashDisplay.textContent = '₱0.00';
            changeAmount.textContent = '₱0.00'; // Reset change display
            return; // Exit function if change is negative
        }

        // Validate if cash is entered
        if (isNaN(cashReceived) || cashReceived <= 0) {
            showErrorModal('Please enter a valid cash amount.');

            // Clear the cash input and cash display for correction
            cashInput.value = '';
            cashDisplay.textContent = '₱0.00';
            changeAmount.textContent = '₱0.00'; // Reset change display
            return; // Exit the function if cash is invalid
        }

        // Prepare data payload
        const paymentData = {
            order_id: orderId,
            subtotal: subtotal,
            tax: tax,
            total: total,
            cash_received: cashReceived,
            change: change,
            discount_type: discountType,
            discount_percentage: discountPercentage
        };

        // Send data to the backend using fetch
        fetch('/save_payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessModal('Payment saved successfully!');
                showModal();
            } else {
                showErrorModal('Failed to save payment. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error saving payment:', error);
            showErrorModal('An error occurred. Please try again.');
        });
    });

    closeModalButton.addEventListener('click', function () {
        hideModal();
    });

    window.addEventListener('click', function (event) {
        if (event.target === paymentModal) {
            hideModal();
        }
    });
}

/// Ensure Confirm Button is Enabled After Adding Cash
if (addButton && cashInputPaymentMethod && cashDisplay) {
    addButton.addEventListener('click', function () {
        const cashAmount = parseFloat(cashInputPaymentMethod.value) || 0;

        if (cashAmount <= 0) {
            showErrorModal('Please enter a valid cash amount.');
            return;
        }

        // Update cash display
        cashDisplay.textContent = `₱${cashAmount.toFixed(2)}`;

        // Update change calculation
        const totalAmount = parseFloat(totalAmountDisplay.textContent.replace('₱', '').replace(',', '')) || 0;
        const change = cashAmount - totalAmount;
        changeAmount.textContent = `₱${change.toFixed(2)}`;

        // Disable the add button after adding cash
        addButton.disabled = true;
        addButton.style.backgroundColor = '#ccc'; // Optional: Change button appearance

        // ✅ Enable confirm button after adding valid cash
        confirmPaymentBtn.disabled = false;
        confirmPaymentBtn.style.backgroundColor = '#c8131a'; // Change button to red (active)
        confirmPaymentBtn.style.cursor = 'pointer';

        // Clear input field
        cashInputPaymentMethod.value = '';

        // Show success modal
        showSuccessModal('You have successfully applied the payment!');
    });
}

if (closeModalButton) {
    const printReceiptModal = document.getElementById('printReceiptModal');
    const modalCloseButton = document.getElementById('modalCloseButton');

    closeModalButton.addEventListener('click', function () {
        console.log('Print Official Receipt button clicked!'); // Log the button click

        // Show the custom modal
        if (printReceiptModal) {
            printReceiptModal.style.display = 'flex';
        }

        // Simulate a delay for "Printing" functionality (e.g., 3 seconds)
        setTimeout(() => {
            console.log('Printing process completed.'); // Simulate print completion
        }, 3000);
    });

    // Handle closing the modal
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', function () {
            // Hide the modal
            if (printReceiptModal) {
                printReceiptModal.style.display = 'none';
            }

            // Redirect to the sales-order page
            window.location.href = '/sales_order';
        });
    }

    // Close the modal if clicking outside of it
    window.addEventListener('click', function (event) {
        if (event.target === printReceiptModal) {
            printReceiptModal.style.display = 'none';
        }
    });
}



    // Discount Button Toggle Functionality (Senior / PWD)
    if (discountButtons.length > 0) {
        discountButtons.forEach(button => {
            button.addEventListener('click', function () {
                discountButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = '#f1f1f1'; // Default gray
                    btn.style.color = 'black';
                });

                // Set the active discount button
                this.classList.add('active');
                this.style.backgroundColor = '#c8131a'; // Red when selected
                this.style.color = 'white';

                // Set the discount type based on the selected button
                if (this.id === 'senior-btn') {
                    discountType = 'Senior Discount';
                } else if (this.id === 'pwd-btn') {
                    discountType = 'PWD Discount';
                }
            });
        });
    }

// Function to show error alert modal and refresh ONLY for Name & ID errors
function showAlertMessage(message, shouldRefresh = false) {
    const modal = document.createElement('div');
    modal.classList.add('error-modal');

    const modalContent = `
        <div class="modal-content">
            <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="red" class="error-icon">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="red"></circle>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="red"></line>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="red"></line>
                </svg>
            </div>
            <h3>Invalid!</h3>
            <p>${message}</p>
            <button class="close-btn">Ok</button>
        </div>
    `;
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Close modal and refresh page only if needed
    modal.querySelector('.close-btn').addEventListener('click', function () {
        modal.remove();
        if (shouldRefresh) {
            location.reload(); // Refresh the page if required
        }
    });

    // Close modal and refresh page only if needed when clicking outside
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
            if (shouldRefresh) {
                location.reload(); // Refresh the page if required
            }
        }
    });
}



function validateDiscountInputs() {
    const namePattern = /^[A-Za-z,\s]+$/; // Only letters, commas, and spaces allowed
    const idPattern = /^[0-9]{1,12}$/; // Only numbers, 1-12 digits

    const nameValue = nameInput.value.trim();
    const idValue = idInput.value.trim();

    if (nameValue === "" || idValue === "") {
        showAlertMessage("Please fill in all fields!", true); // Refresh required
        return false;
    }

    if (!namePattern.test(nameValue)) {
        showAlertMessage("Invalid Name: Only letters and commas are allowed.", true); // Refresh required
        return false;
    }

    if (!idPattern.test(idValue)) {
        showAlertMessage("Invalid ID Number: Only numbers (1-12 digits) are allowed.", true); // Refresh required
        return false;
    }

    return true;
}



if (applyButton) {
    applyButton.addEventListener('click', function () {
        if (!validateDiscountInputs()) {
            return; // Stop if inputs are invalid (refresh will happen if needed)
        }

        if (!discountType) {
            showAlertMessage("Please select a discount type."); // No refresh for discount type error
            return;
        }

        const totalAmount = parseFloat(totalAmountDisplay.textContent.replace('₱', '').replace(',', '')) || 0;
        let discountPercentage = 0;

        // ✅ Compute VAT-Exempt Sales (Sub-total)
        const subTotal = totalAmount / 1.12;
        const vatAmount = totalAmount - subTotal; // VAT amount
        const discountableAmount = subTotal; // Discount applies to sub-total

        // Set correct discount percentage
        if (discountType === 'Senior Discount') {
            discountPercentage = seniorDiscount;
        } else if (discountType === 'PWD Discount') {
            discountPercentage = pwdDiscount;
        }

        if (discountPercentage === 0) {
            showAlertMessage('Please select a discount type.');
            return;
        }

        // ✅ Compute Discount
        const discountAmount = discountableAmount * discountPercentage;
        const amountDue = subTotal - discountAmount; // Final amount after discount

        // Update UI
        document.getElementById('discountable-value').textContent = `₱${discountableAmount.toFixed(2)}`;
        document.getElementById('discount-amount').textContent = `${(discountPercentage * 100).toFixed(0)}%`;
        document.getElementById('discount-detail').textContent = `-₱${discountAmount.toFixed(2)}`;
        document.getElementById('total-amount').textContent = `₱${amountDue.toFixed(2)}`;
        document.querySelector('.discountable-amount').style.display = 'flex';
        document.querySelector('.discount-section').style.display = 'flex';

        // ✅ Update Discount Info
        document.getElementById('applied-discount-info').innerHTML = `
            <p><strong>Discount Type:</strong> ${discountType}</p>
            <p><strong>Name:</strong> ${nameInput.value}</p>
            <p><strong>ID Number:</strong> ${idInput.value}</p>
        `;
        document.getElementById('applied-discount-info').style.display = 'block';

        discountApplied = true;
    });

}


});

// Restrict Name Input (Only Letters & Comma)
nameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z,\s]/g, "");
});

// Restrict ID Input (Only Numbers, Max 12 Digits)
idInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 12);
});


// JavaScript to validate cash input without resetting the field
document.getElementById("cash-input").addEventListener("input", function(event) {
    let value = event.target.value;

    // If the input is empty, just return
    if (!value) return;

    // Regular expression to allow only numbers and a single decimal point
    let validValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point is allowed
    if ((validValue.match(/\./g) || []).length > 1) {
        validValue = validValue.replace(/\.+$/, ""); // Remove additional decimal points
    }

    // Set the input value to the valid value only if it's changed
    if (validValue !== value) {
        event.target.value = validValue;
    }


});


