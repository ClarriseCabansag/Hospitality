document.addEventListener("DOMContentLoaded", function () {
    const openTillAmount = document.getElementById("openTillAmount");
    const tillAmountDisplay = document.querySelector(".till-amount-display");
    const keypadButtons = document.querySelectorAll(".keypad button");
    const deleteButton = document.querySelector('button i.fas.fa-backspace'); // Target the icon inside the button

    let tillAmount = "";

    // Check if till has already been opened (check session variable)
    fetch('/check_till_status')
        .then(response => response.json())
        .then(data => {
            if (data.till_opened) {
                openTillAmount.style.display = "none";
            } else {
                openTillAmount.style.display = "block";
            }
        })
        .catch(error => console.error('Error:', error));

    // Handle keypad input
    keypadButtons.forEach(button => {
        button.addEventListener("click", function () {
            const value = this.textContent;
            if (value !== "⌫") {
                tillAmount += value; // Add the number to tillAmount
            } else {
                tillAmount = tillAmount.slice(0, -1);  // Remove last character
            }
            tillAmountDisplay.value = tillAmount;
        });
    });

    // Handle delete via custom delete button (backspace icon button)
    if (deleteButton) {
        deleteButton.closest('button').addEventListener('click', function() {
            console.log('Delete button clicked');
            tillAmount = tillAmount.slice(0, -1); // Remove last character when custom delete button is clicked
            tillAmountDisplay.value = tillAmount;  // Update the display
        });
    } else {
        console.log('Delete button not found');
    }

    // Handle delete via Backspace key
    tillAmountDisplay.addEventListener("keydown", function (event) {
        if (event.key === "Backspace") {
            tillAmount = tillAmount.slice(0, -1);  // Remove last character when backspace is pressed
            tillAmountDisplay.value = tillAmount;  // Update the display
            console.log('Backspace pressed, tillAmount:', tillAmount); // Debugging line
        }
    });

    // Clean the input field to allow only numbers
    function validateInput(value) {
        return value.replace(/[^0-9]/g, '');  // Keep only numeric values
    }

    tillAmountDisplay.addEventListener("input", function () {
        this.value = validateInput(this.value);  // Clean input field
    });

    // Capture and send the current time in 12-hour format (AM/PM)
    function formatTimeTo12Hour(time) {
        let date = new Date(time);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    document.querySelector('.btn-open-drawer').addEventListener('click', function () {
        const tillAmountInput = document.querySelector('.till-amount-display');
        const tillAmount = parseFloat(tillAmountInput.value);

        if (!tillAmount || tillAmount <= 0) {
            showErrorModal('Please enter a valid amount');
            return;
        }

        const currentTime = new Date();
        const formattedTime = formatTimeTo12Hour(currentTime); // Format the time to AM/PM format

        // Send data to Flask API
        fetch('/open_till', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: tillAmount, time: formattedTime })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    // Replace alert with the success modal
                showSuccessModal('Till opened with amount: ₱' + data.amount);

                    document.getElementById('openTillAmount').style.display = 'none'; // Close the modal
                }
            })
            .catch(error => console.error('Error:', error));
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
            <h3> Till Amount Opened!</h3>
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
    });

});


    //menu.js//
    document.addEventListener('DOMContentLoaded', function () {
        const categories = document.querySelectorAll('.category'); // All category buttons
        const menuSections = document.querySelectorAll('.menu-items'); // All menu sections

        // Display all sections by default
        menuSections.forEach(section => {
            section.style.display = 'block';
        });

   const fetchAndDisplayCategoryItems = (categoryKeywords, containerId) => {
    fetch('/api/inventory_data')
        .then(response => response.json())
        .then(data => {
            console.log(`Fetched Data for categories: ${categoryKeywords}`, data);

            const container = document.getElementById(containerId);

            const filteredItems = data.filter(item =>
                categoryKeywords.some(keyword =>
                    item.category.trim().toLowerCase() === keyword.toLowerCase()
                )
            );

            if (filteredItems.length === 0) {
                console.warn(`No items found for categories: ${categoryKeywords}`);
            }

            filteredItems.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');
                menuItem.setAttribute('data-category', categoryKeywords.join(', '));

                const imageUrl = item.image_url || '/path/to/default-image.jpg';
                const pcs = item.pcs ? `${item.pcs} pcs` : ''; // Ensure pcs is stored

                // Ensure each ingredient has a pcs count
                const formattedIngredients = item.ingredients
                    .split(',')
                    .map(ing => {
                        const match = ing.trim().match(/^(\d*)\s*pcs\s*(.+)$/i);
                        const quantity = match ? match[1] : "1"; // Default to 1 pcs
                        const name = match ? match[2] : ing.trim();
                        return `${quantity} pcs ${name}`;
                    })
                    .join(', ');

                menuItem.innerHTML = `
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.src='/path/to/default-image.jpg';">
                    <p class="item-name">${item.name}</p>
                    <p class="ingredients">${formattedIngredients}</p> <!-- Correctly formatted ingredients -->
                    <span>₱${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                `;

                container.appendChild(menuItem);
            });
        })
        .catch(error => console.error(`Error fetching data for categories: ${categoryKeywords}`, error));
};


        // Fetch items for each category
        fetchAndDisplayCategoryItems(['Solo Boodle Flight'], 'menu-grid-solo');
        fetchAndDisplayCategoryItems(['Boodle Flight'], 'menu-grid-boodle');
        fetchAndDisplayCategoryItems(['A La Carte'], 'menu-grid-a-la-carte');
        fetchAndDisplayCategoryItems(['Single Flights'], 'menu-grid-single-flights');
        fetchAndDisplayCategoryItems(['International Flights'], 'menu-grid-international-flights');
        fetchAndDisplayCategoryItems(['Uncle Ice Cream'], 'menu-grid-uncle');
        fetchAndDisplayCategoryItems(['Drinks', 'Beers', 'Shakes'], 'menu-grid-drinks');

        // Add category filtering functionality
        categories.forEach(category => {
            category.addEventListener('click', function () {
                const selectedCategory = this.getAttribute('data-category');

                // Remove 'active' class from all categories
                categories.forEach(cat => cat.classList.remove('active'));

                // Add 'active' class to the clicked category
                this.classList.add('active');

                if (selectedCategory === 'all') {
                    // Show all menu sections
                    menuSections.forEach(section => {
                        section.style.display = 'block';
                    });
                } else {
                    // Hide all menu sections
                    menuSections.forEach(section => {
                        section.style.display = 'none';
                    });

                    // Show the selected category's menu items
                    const activeSection = document.getElementById(selectedCategory);
                    if (activeSection) {
                        activeSection.style.display = 'block';
                    }
                }
            });
        });
    });


//ordersummary.js//
document.addEventListener('DOMContentLoaded', function () {
    const emptyCart = document.getElementById('emptyCart');
    const orderOptions = document.getElementById('orderOptions');
    const orderSummary = document.getElementById('orderSummary');
    const totalAmountContainer = document.getElementById('totalAmountContainer');
    const totalAmountElement = document.getElementById('totalAmount');
    const btnDineIn = document.querySelector('.btn-dine-in');
    const btnTakeOut = document.querySelector('.btn-take-out');

    let orderID = null;

    function generateOrderID() {
        return 'ORD' + Date.now();
    }

    function getCurrentDate() {
        const date = new Date();
        return date.toDateString();
    }

    function ensureOrderDetails() {
        if (!orderID) {
            orderID = generateOrderID();
        }
        const currentDate = getCurrentDate();

        let orderContainer = document.querySelector('.order-container');
        if (!orderContainer) {
            orderContainer = document.createElement('div');
            orderContainer.classList.add('order-container');
            orderContainer.innerHTML = `
                <p><strong>Order ID:</strong> ${orderID}</p>
                <p><strong>Date:</strong> ${currentDate}</p>
            `;
            orderSummary.prepend(orderContainer);
        }
    }

    function updateQuantity(button, increment) {
        const quantityElement = button.closest('.order-controls').querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent, 10);
        quantity = Math.max(1, quantity + increment);
        quantityElement.textContent = quantity;
        calculateTotalAmount();
    }

    function calculateTotalAmount() {
        let totalAmount = 0;
        const items = orderSummary.querySelectorAll('.item-container');
        items.forEach(item => {
            const priceElement = item.querySelector('.order-item-content span');
            const quantityElement = item.querySelector('.quantity');
            const price = parseFloat(priceElement.textContent.replace(/[^\d.-]/g, ''));
            const quantity = parseInt(quantityElement.textContent, 10);
            totalAmount += price * quantity;
        });
        totalAmountElement.textContent = `₱${totalAmount.toFixed(2)}`;
    }

    function deleteOrderItem(button) {
        const itemContainer = button.closest('.item-container');
        itemContainer.remove();
        calculateTotalAmount();

        if (orderSummary.querySelectorAll('.item-container').length === 0) {
            orderID = null;
            const orderContainer = document.querySelector('.order-container');
            if (orderContainer) orderContainer.remove();
            emptyCart.style.display = 'block';
            orderOptions.style.display = 'none';
            totalAmountContainer.style.display = 'none';
        }
    }

    function handleEditButton(button) {
        const itemContainer = button.closest('.item-container');
        const noteModal = document.getElementById('noteModal');
        noteModal.style.display = 'block';

        const existingNotes = itemContainer.querySelector('.order-notes')?.textContent || '';
        const noteInput = noteModal.querySelector('#noteInput');
        noteInput.value = existingNotes.replace('Notes: ', '');

        const addNoteButton = noteModal.querySelector('#addNoteButton');
        const cancelNoteButton = noteModal.querySelector('#cancelNoteButton');

        addNoteButton.onclick = function () {
            const notes = noteInput.value.trim();
            let notesElement = itemContainer.querySelector('.order-notes');

            if (!notesElement) {
                notesElement = document.createElement('div');
                notesElement.classList.add('order-notes');
                const priceElement = itemContainer.querySelector('.order-item-content span');
                priceElement.insertAdjacentElement('afterend', notesElement);
            }

            notesElement.textContent = `Notes: ${notes}`;
            noteModal.style.display = 'none';
        };

        cancelNoteButton.onclick = function () {
            noteModal.style.display = 'none';
        };
    }

    document.querySelectorAll('.menu-grid').forEach(menuGrid => {
        menuGrid.addEventListener('click', function (event) {
            if (event.target.tagName === 'IMG') {
                const clickedImage = event.target;
                const menuItem = clickedImage.closest('.menu-item');
                const itemName = menuItem.querySelector('.item-name').textContent;
                const itemIngredients = menuItem.querySelector('.ingredients').textContent;
                const itemPrice = menuItem.querySelector('span').textContent;

                const formattedIngredients = itemIngredients
                    .split(',')
                    .map(ing => ing.trim())
                    .join(', ');

                ensureOrderDetails();

                const existingItem = Array.from(orderSummary.querySelectorAll('.order-item-content')).find(item => {
                    return item.querySelector('p.item-name').textContent === itemName;
                });

                if (existingItem) {
                    const quantityElement = existingItem.closest('.item-container').querySelector('.quantity');
                    quantityElement.textContent = parseInt(quantityElement.textContent, 10) + 1;
                    calculateTotalAmount();
                    return;
                }

                emptyCart.style.display = 'none';
                orderOptions.style.display = 'block';

                const itemContainer = document.createElement('div');
                itemContainer.classList.add('item-container');

                const itemElement = document.createElement('div');
                itemElement.classList.add('order-item');
                itemElement.innerHTML = `
                    <img src="${clickedImage.src}" alt="${itemName}" class="order-summary-image">
                    <div class="order-item-content">
                        <p class="item-name">${itemName}</p>
                        <p class="order-ingredients">${formattedIngredients}</p>
                        <span>${itemPrice}</span>
                    </div>
                `;

                const controlsElement = document.createElement('div');
                controlsElement.classList.add('order-controls');
                controlsElement.innerHTML = `
                    <div class="left-controls">
                        <button class="minus"><i class="fas fa-minus-circle"></i></button>
                    </div>
                    <div class="quantity-container">
                        <span class="quantity">1</span>
                    </div>
                    <div class="right-controls">
                        <button class="plus"><i class="fas fa-plus-circle"></i></button>
                    </div>
                    <div class="extra-controls">
                        <button class="edit"><i class="fas fa-pen"></i></button>
                        <button class="delete"><i class="fas fa-trash"></i></button>
                    </div>
                `;

                itemContainer.appendChild(itemElement);
                itemContainer.appendChild(controlsElement);
                orderSummary.appendChild(itemContainer);

                calculateTotalAmount();
            }
        });
    });


    // Event listeners for minus and plus buttons
    orderSummary.addEventListener('click', function (event) {
        if (event.target.closest('.minus')) {
            updateQuantity(event.target.closest('.minus'), -1);
        } else if (event.target.closest('.plus')) {
            updateQuantity(event.target.closest('.plus'), 1);
        }
    });

    // Event listener for delete buttons
    orderSummary.addEventListener('click', function (event) {
        if (event.target.closest('.delete')) {
            deleteOrderItem(event.target.closest('.delete')); // Call delete function
        }
    });

    // Event listener for edit buttons
    orderSummary.addEventListener('click', function (event) {
        if (event.target.closest('.edit')) {
            handleEditButton(event.target.closest('.edit')); // Call edit handler
        }
    });

    // Attach event listener to the "Dine In" and "Take Out" buttons
    if (btnDineIn) {
        btnDineIn.addEventListener('click', function () {
            totalAmountContainer.style.display = 'block';
        });
    }

    if (btnTakeOut) {
        btnTakeOut.addEventListener('click', function () {
            totalAmountContainer.style.display = 'block';
        });
    }
});


document.addEventListener("DOMContentLoaded", function() {
    // Get the required buttons and continue button
    const dineInButton = document.querySelector('.btn-dine-in');
    const takeOutButton = document.querySelector('.btn-take-out');
    const continueButton = document.getElementById("continueButton");

    // Function to collect order details
    function collectOrderDetails() {
    const orderDetails = {
        orderID: null,
        date: null,
        items: [],
        orderType: null,
        totalAmount: null,
    };

    // Get Order ID and Date
    const orderContainer = document.querySelector('.order-container');
    if (orderContainer) {
        orderDetails.orderID = orderContainer.querySelector('p:nth-child(1)').textContent.replace('Order ID: ', '');
        orderDetails.date = orderContainer.querySelector('p:nth-child(2)').textContent.replace('Date: ', '');
    }

    // Get Menu Items, Quantities, and Ingredients
    const items = document.querySelectorAll('.item-container');
    items.forEach(item => {
        const itemName = item.querySelector('.order-item-content .item-name').textContent;
        const itemPrice = parseFloat(item.querySelector('.order-item-content span').textContent.replace(/[^\d.-]/g, ''));
        const itemQuantity = parseInt(item.querySelector('.quantity').textContent, 10);
        const itemIngredients = item.querySelector('.order-ingredients').textContent;

        orderDetails.items.push({
            name: itemName,
            price: itemPrice,
            quantity: itemQuantity,
            ingredients: itemIngredients  // ✅ Include ingredients
        });
    });

    // Get Order Type
    if (dineInButton.classList.contains('clicked')) {
        orderDetails.orderType = 'Dine In';
    } else if (takeOutButton.classList.contains('clicked')) {
        orderDetails.orderType = 'Take Out';
    }

    // Get Total Amount
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        orderDetails.totalAmount = parseFloat(totalAmountElement.textContent.replace(/[^\d.-]/g, ''));
    }

    return orderDetails;
}



// Function to display a success modal
function showSuccessModal(message, onOkCallback) {
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
            <p>${message}</p>
            <button class="close-btn">Ok</button>
        </div>
    `;
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Handle "OK" button click
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', function () {
        modal.remove();
        if (typeof onOkCallback === 'function') {
            onOkCallback(); // Execute the callback after clicking OK
        }
    });

    // Close modal when clicking outside of it
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Updated payment.js logic
if (dineInButton && takeOutButton && continueButton) {
    continueButton.addEventListener("click", async function() {
        const orderDetails = collectOrderDetails();

        try {
            const response = await fetch('/save_order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });

            const result = await response.json();
            if (result.success) {
                showSuccessModal('Order saved successfully!', function() {
                    // Redirect after clicking OK
                    if (orderDetails.orderType === 'Dine In') {
                        window.location.href = '/seats';
                    } else {
                        window.location.href = '/payment';
                    }
                });
            } else {
                alert('Failed to save the order: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            alert('An error occurred while saving the order.');
        }
    });

    // Toggle 'clicked' class for order type selection
    dineInButton.addEventListener('click', function() {
        takeOutButton.classList.remove('clicked');
        dineInButton.classList.toggle('clicked');
    });

    takeOutButton.addEventListener('click', function() {
        dineInButton.classList.remove('clicked');
        takeOutButton.classList.toggle('clicked');
    });
} else {
    console.log("One or more required elements are missing.");
}


});



  // Function to fetch cashier name and update the page
        async function loadCashierName() {
            try {
                const response = await fetch('/get_cashier_name');
                if (response.ok) {
                    const data = await response.json();
                    // Set the cashier name in the placeholder
                    const fullName = `${data.name} ${data.last_name}`;
                    document.getElementById('cashier-name').textContent = `Cashier: ${fullName}`;
                } else {
                    document.getElementById('cashier-name').textContent = 'Cashier: Not authenticated';
                }
            } catch (error) {
                console.error('Error fetching cashier name:', error);
                document.getElementById('cashier-name').textContent = 'Cashier: Error loading name';
            }
        }

        // Call the function when the page loads
   window.onload = loadCashierName;