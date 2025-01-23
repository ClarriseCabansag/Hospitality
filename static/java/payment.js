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

    let discountApplied = false;
    let discountType = '';
    const seniorDiscount = 0.20; // 20% discount
    const pwdDiscount = 0.15; // 15% discount

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

    // Handle Cash Add Button
    if (addButton && cashInputPaymentMethod && cashDisplay) {
        addButton.addEventListener('click', function () {
            const cashAmount = parseFloat(cashInputPaymentMethod.value) || 0; // Get entered cash amount

            if (cashAmount <= 0) {
                alert('Please enter a valid cash amount.');
                return;
            }

            // Update the displayed cash in the payment summary
            cashDisplay.textContent = `₱${cashAmount.toFixed(2)}`;

            // Update the change calculation
            const totalAmount = parseFloat(totalAmountDisplay.textContent.replace('₱', '').replace(',', '')) || 0;
            const change = cashAmount - totalAmount;

            changeAmount.textContent = `₱${change.toFixed(2)}`;

            // Clear the cash input field in the payment method
            cashInputPaymentMethod.value = '';
        });
    }

    // Handle Payment Modal
    if (confirmPaymentBtn && paymentModal && closeModalButton) {
        function showModal() {
            paymentModal.style.display = 'flex';
        }

        function hideModal() {
            paymentModal.style.display = 'none';
        }

        confirmPaymentBtn.addEventListener('click', function () {
    // Collect payment data
    const orderId = document.querySelector('.order-id-value').textContent.trim();
    const subtotal = parseFloat(document.querySelector('.subtotal p:nth-child(2)').textContent.replace('₱', '').replace(',', '')) || 0;
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const total = parseFloat(totalAmountDisplay.textContent.replace('₱', '').replace(',', '')) || 0;
    const cashReceived = parseFloat(cashDisplay.textContent.replace('₱', '').replace(',', '')) || 0; // Use cash from cashDisplay
    const change = parseFloat(changeAmount.textContent.replace('₱', '').replace(',', '')) || 0;

    // Check if a discount has been applied
    const discountType = document.getElementById('discount-type').textContent.trim() || null;
    const discountPercentage = discountApplied ? parseFloat(discountAmountElement.textContent.replace('%', '')) / 100 : null;

    // Check if cash is entered
    if (isNaN(cashReceived) || cashReceived <= 0) {
        alert('Please enter a valid cash amount.');
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
                alert('Payment saved successfully!');
                showModal();
            } else {
                alert('Failed to save payment. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error saving payment:', error);
            alert('An error occurred. Please try again.');
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

    // Handle Printing Receipt and Redirecting
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function () {
            console.log('Print Official Receipt button clicked!');  // Log the button click to verify

            // Simulate printing the receipt (you can replace this with your actual print functionality)
            alert('Printing receipt...');

            // Redirect to the sales-order.html page
            window.location.href = '/sales_order';  // Redirect to the sales-order page
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

    // Handle Discount Application
    if (applyButton) {
        applyButton.addEventListener('click', function () {
            if (discountType) {
                const subtotal = parseFloat(document.querySelector('.subtotal p:nth-child(2)').textContent.replace('₱', '').replace(',', '')) || 0;
                let discountPercentage = 0;

                // Determine the discount percentage based on selected discount type
                if (discountType === 'Senior Discount') {
                    discountPercentage = seniorDiscount;
                } else if (discountType === 'PWD Discount') {
                    discountPercentage = pwdDiscount;
                }

                if (discountPercentage === 0) {
                    alert('Please select a discount type.');
                    return;
                }

                // Calculate the new total with the discount
                const discountAmount = subtotal * discountPercentage;
                const newTotal = subtotal - discountAmount + (subtotal * 0.05); // Subtotal - discount + tax

                // Display the percentage and new total
                discountSection.style.display = 'flex'; // Show the discount section
                discountAmountElement.textContent = `${discountPercentage * 100}%`; // Show the discount percentage
                totalAmountDisplay.textContent = `₱${newTotal.toFixed(2)}`; // Show new total amount

                // Update the discount type display
                const discountTypeElement = document.getElementById('discount-type');
                discountTypeElement.textContent = ` ${discountType}`;

                discountApplied = true;

                // Clear the discount input fields after applying the discount
                const discountInputs = document.querySelectorAll('.discount-summary .input-fields input');
                discountInputs.forEach(input => {
                    input.value = ''; // Clear input fields
                });

                // Reset discount type and buttons
                discountType = '';
                discountButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = '#f1f1f1'; // Default gray
                    btn.style.color = 'black';
                });
            } else {
                alert('Please select a discount type.');
            }
        });
    }
});
