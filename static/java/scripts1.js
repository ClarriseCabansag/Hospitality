document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popup");
    const openTillAmount = document.getElementById("openTillAmount");
    const tillAmountDisplay = document.querySelector(".till-amount-display");
    const keypadButtons = document.querySelectorAll(".keypad button");
    const btnYes = document.getElementById("btnYes");
    const btnNo = document.getElementById("btnNo");

    let tillAmount = "";

    // Handle Yes button in the popup
    btnYes.addEventListener("click", function () {
        popup.style.display = "none";
        openTillAmount.style.display = "block";
    });

    // Handle No button in the popup
    btnNo.addEventListener("click", function () {
        popup.style.display = "none";
    });

    // Handle keypad input
    keypadButtons.forEach(button => {
        button.addEventListener("click", function () {
            const value = this.textContent;
            if (value === "⌫") {
                tillAmount = tillAmount.slice(0, -1);
            } else {
                tillAmount += value;
            }
            tillAmountDisplay.value = tillAmount;
        });
    });

    function validateInput(value) {
        // Remove any non-digit characters and return only digits
        return value.replace(/[^0-9]/g, '');
    }

    // Handle keyboard input for the till amount display
    tillAmountDisplay.addEventListener("keydown", function (event) {
        // Allow only numeric keys and basic control keys
        if (event.key === "Backspace" || event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Tab" || event.key === "Enter") {
            return;
        }
        if (event.key < "0" || event.key > "9") {
            event.preventDefault();
        }
    });

    // Ensure input field only contains integer values
    tillAmountDisplay.addEventListener("input", function () {
        this.value = validateInput(this.value);
    });

    // Open drawer button
    document.querySelector(".btn-open-drawer").addEventListener("click", function () {
        alert("Drawer opened with amount: " + tillAmount);
        // Reset the till amount
        tillAmount = "";
        tillAmountDisplay.value = tillAmount;
        openTillAmount.style.display = "none";
    });
});

//menu.js
document.addEventListener('DOMContentLoaded', function () {
    const categories = document.querySelectorAll('.category');
    const menuSections = document.querySelectorAll('.menu-items');

    // Display all sections by default
    menuSections.forEach(section => {
        section.style.display = 'block';
    });

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

// ordersummary.js
document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.menu-item img');
    const emptyCart = document.getElementById('emptyCart');
    const orderOptions = document.getElementById('orderOptions');
    const buttons = document.querySelectorAll('.order-options button');
    const orderSummary = document.getElementById('orderSummary');
    const totalAmountContainer = document.getElementById('totalAmountContainer');
    const totalAmountElement = document.getElementById('totalAmount'); // Element to display total amount
    const btnDineIn = document.querySelector('.btn-dine-in');
    const btnTakeOut = document.querySelector('.btn-take-out');

    // Popup elements for editing notes
    const popupContainer = document.getElementById('editpopupContainer');
    const saveNotesButton = document.getElementById('saveNotes');
    const cancelPopupButton = document.getElementById('cancelPopup');
    const notesInput = document.getElementById('notesInput');
    let currentOrderItem = null; // Store the current item being edited

    let orderID = null; // To store the orderID for the session

    // Function to generate a unique order ID (for simplicity, using a timestamp)
    function generateOrderID() {
        return 'ORD' + Date.now();
    }

    // Function to get the current date in a readable format
    function getCurrentDate() {
        const date = new Date();
        return date.toDateString();
    }

    // Function to update the quantity
    function updateQuantity(button, increment) {
        const quantityElement = button.closest('.order-controls').querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent, 10);
        quantity = Math.max(1, quantity + increment); // Prevent quantity from going below 1
        quantityElement.textContent = quantity;

        calculateTotalAmount(); // Recalculate total after changing quantity
    }

    // Function to calculate the total amount of the order
    function calculateTotalAmount() {
        let totalAmount = 0;

        // Loop through all order items and calculate the total price
        const items = orderSummary.querySelectorAll('.item-container');
        items.forEach(item => {
            const priceElement = item.querySelector('.order-item-content span');
            const quantityElement = item.querySelector('.quantity');

            const price = parseFloat(priceElement.textContent.replace(/[^\d.-]/g, '')); // Extract number from price
            const quantity = parseInt(quantityElement.textContent, 10);

            totalAmount += price * quantity; // Add item total to the total amount
        });

        // Update the total amount display
        totalAmountElement.textContent = `₱${totalAmount.toFixed(2)}`;
    }

    // Function to show the edit popup
    function showPopup(orderItem) {
        popupContainer.style.display = 'flex'; // Show the popup
        notesInput.value = ''; // Clear previous input
        currentOrderItem = orderItem; // Store the item being edited
    }

    // Function to hide the popup
    function hidePopup() {
        popupContainer.style.display = 'none'; // Hide the popup
    }

   // Function to delete an order item
    function deleteOrderItem(button) {
    const itemContainer = button.closest('.item-container'); // Find the closest item container
    itemContainer.remove(); // Remove the item

    calculateTotalAmount(); // Recalculate the total after an item is removed

    // Check if the orderSummary is empty
    if (orderSummary.childElementCount === 1) { // The first child is the order container (Order ID/Date)
        // Remove order summary and total amount
        orderSummary.innerHTML = ''; // Clear the order summary
        totalAmountElement.textContent = '₱0.00'; // Reset the total amount
        totalAmountContainer.style.display = 'none'; // Hide the total amount container

        // Show the empty cart message
        emptyCart.style.display = 'block';

        // Hide the order options section
        orderOptions.style.display = 'none';

        // Reset the orderID to null for the next session
        orderID = null;
    }
}

    images.forEach(image => {
        image.addEventListener('click', function () {
            // Hide the empty cart section
            emptyCart.style.display = 'none';

            // Show the order options section
            orderOptions.style.display = 'block';

            // Generate the order ID only if it's null (i.e., first item clicked in this session)
            if (!orderID) {
                orderID = generateOrderID();
            }

            // Get the current date
            const currentDate = getCurrentDate();

            // Get the parent .menu-item element
            const menuItem = this.parentElement;

            // Extract item details from the parent .menu-item element
            const itemName = menuItem.querySelector('p').textContent;
            const itemPrice = menuItem.querySelector('span').textContent;

            // Create a new container for the image, name, price, and buttons
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('item-container');

            // Create item details element
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            itemElement.innerHTML = `
                <img src="${this.src}" alt="${itemName}" class="order-summary-image">
                <div class="order-item-content">
                    <p>${itemName}</p>
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

            // Append item details and controls to the item container
            itemContainer.appendChild(itemElement);
            itemContainer.appendChild(controlsElement);

            // If this is the first item, display the order ID and date only once
            if (orderSummary.childElementCount === 0) {
                // Create the container for order ID and date
                const orderContainer = document.createElement('div');
                orderContainer.classList.add('order-container');

                // Create order summary elements
                const orderIDElement = document.createElement('div');
                orderIDElement.innerHTML = `<p>Order ID</p><p>${orderID}</p>`;

                const dateElement = document.createElement('div');
                dateElement.innerHTML = `<p>Date</p><p>${currentDate}</p>`;

                // Append order ID and date to the container
                orderContainer.appendChild(orderIDElement);
                orderContainer.appendChild(dateElement);

                // Append the order ID and date container at the top of the summary
                orderSummary.appendChild(orderContainer);
            }

            // Append the item to the order summary (without removing the existing ones)
            orderSummary.appendChild(itemContainer);
            calculateTotalAmount(); // Calculate total after adding an item
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

    // Event listener to show the popup when the edit button is clicked
    orderSummary.addEventListener('click', function (event) {
        if (event.target.closest('.edit')) {
            const orderItem = event.target.closest('.order-item'); // Get the closest order item
            showPopup(orderItem);
        }
    });

    // Event listener for delete buttons
    orderSummary.addEventListener('click', function (event) {
        if (event.target.closest('.delete')) {
            deleteOrderItem(event.target.closest('.delete')); // Call delete function
        }
    });

    // Cancel popup functionality
    cancelPopupButton.addEventListener('click', function () {
        hidePopup(); // Hide the popup when cancel is clicked
    });

    // Save notes functionality
    saveNotesButton.addEventListener('click', function () {
        const notes = notesInput.value.trim();
        if (notes && currentOrderItem) {
            // Create or update the notes element within the order item
            let notesElement = currentOrderItem.querySelector('.order-notes');
            if (!notesElement) {
                notesElement = document.createElement('p');
                notesElement.classList.add('order-notes');
                currentOrderItem.appendChild(notesElement);
            }
            notesElement.textContent = `Notes: ${notes}`;
            hidePopup(); // Hide the popup after saving
        }
    });

    // Attach event listener to the "Dine In" and "Take Out" buttons
    if (btnDineIn) {
        btnDineIn.addEventListener('click', function() {
            totalAmountContainer.style.display = 'block';
        });
    }

    if (btnTakeOut) {
        btnTakeOut.addEventListener('click', function() {
            totalAmountContainer.style.display = 'block';
        });
    }
});
document.addEventListener("DOMContentLoaded", function() {
    const dineInButton = document.querySelector('.btn-dine-in');
    const takeOutButton = document.querySelector('.btn-take-out');

    dineInButton.addEventListener('click', function() {
        // Remove 'clicked' class from take-out button if it's added
        takeOutButton.classList.remove('clicked');
        // Toggle 'clicked' class for dine-in button
        dineInButton.classList.toggle('clicked');
    });

    takeOutButton.addEventListener('click', function() {
        // Remove 'clicked' class from dine-in button if it's added
        dineInButton.classList.remove('clicked');
        // Toggle 'clicked' class for take-out button
        takeOutButton.classList.toggle('clicked');
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const dineInButton = document.querySelector('.btn-dine-in');
    const takeOutButton = document.querySelector('.btn-take-out');
    const continueButton = document.getElementById("continueButton"); // Get the continue button

    continueButton.addEventListener("click", function() {
        // Check if Dine In or Take Out is clicked
        if (dineInButton.classList.contains('clicked')) {
            // If Dine In is clicked, navigate to seats.html
            window.location.href = '/seats';
        } else if (takeOutButton.classList.contains('clicked')) {
            // If Take Out is clicked, navigate to payment.html
            window.location.href = '/payment';
        }
    });
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

