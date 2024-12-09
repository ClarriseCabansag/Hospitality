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
            alert('Please enter a valid amount');
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
                    alert('Till opened with amount: ₱' + data.amount);
                    document.getElementById('openTillAmount').style.display = 'none'; // Close the modal
                }
            })
            .catch(error => console.error('Error:', error));
    });
});


//menu.js
document.addEventListener('DOMContentLoaded', function () {
    const categories = document.querySelectorAll('.category'); // All category buttons
    const menuSections = document.querySelectorAll('.menu-items'); // All menu sections
    const menuGrid = document.querySelector('.menu-grid'); // The grid for displaying items dynamically

    // Display all sections by default
    menuSections.forEach(section => {
        section.style.display = 'block';
    });

    // Function to fetch and populate the inventory items
    const fetchAndDisplayInventory = () => {
        fetch('/api/inventory_data') // Replace with your API endpoint
            .then(response => response.json())
            .then(data => {
                // Clear any existing items
                menuGrid.innerHTML = '';

                data.forEach(item => {
                    // Create a menu item element
                    const menuItem = document.createElement('div');
                    menuItem.classList.add('menu-item');
                    menuItem.setAttribute('data-category', 'solo-boodle-flight'); // Example category

                    // Fix for incomplete image URLs
                    const imageUrl = item.image_url.startsWith('http')
                        ? item.image_url
                        : `https://material-management-system-2.onrender.com${item.image_url}`;

                    // Debugging: Log image URLs to the console
                    console.log(`Image URL for ${item.item}: ${imageUrl}`);

                    // Populate menu item content
                    menuItem.innerHTML = `
                        <img src="${imageUrl}" alt="${item.item}" onerror="this.src='/path/to/default-image.jpg'">
                        <p>${item.item}</p>
                        <span>₱${item.price.toFixed(2)}</span>
                    `;

                    // Append the menu item to the grid
                    menuGrid.appendChild(menuItem);
                });
            })
            .catch(error => console.error('Error fetching inventory data:', error));
    };

    // Fetch and display inventory data on load
    fetchAndDisplayInventory();

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


// ordersummary.js
document.addEventListener('DOMContentLoaded', function () {
    const emptyCart = document.getElementById('emptyCart');
    const orderOptions = document.getElementById('orderOptions');
    const orderSummary = document.getElementById('orderSummary');
    const totalAmountContainer = document.getElementById('totalAmountContainer');
    const totalAmountElement = document.getElementById('totalAmount'); // Element to display total amount
    const btnDineIn = document.querySelector('.btn-dine-in');
    const btnTakeOut = document.querySelector('.btn-take-out');

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


    // Event delegation for menu item image clicks
    document.querySelector('.menu-grid').addEventListener('click', function(event) {
        if (event.target.tagName === 'IMG') {
            const clickedImage = event.target;
            const menuItem = clickedImage.closest('.menu-item'); // Get the parent .menu-item element
            const itemName = menuItem.querySelector('p').textContent;
            const itemPrice = menuItem.querySelector('span').textContent;

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

            // Create a new container for the image, name, price, and buttons
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('item-container');

            // Create item details element
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            itemElement.innerHTML = `
                <img src="${clickedImage.src}" alt="${itemName}" class="order-summary-image">
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
        }
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
    // Get the required buttons and continue button
    const dineInButton = document.querySelector('.btn-dine-in');
    const takeOutButton = document.querySelector('.btn-take-out');
    const continueButton = document.getElementById("continueButton"); // Get the continue button

    // Check if the elements exist before proceeding
    if (dineInButton && takeOutButton && continueButton) {
        // Add event listener for the continue button
        continueButton.addEventListener("click", function() {
            console.log("Continue button clicked");

            // Check if Dine In or Take Out is clicked
            if (dineInButton.classList.contains('clicked')) {
                console.log("Dine In selected");
                window.location.href = '/seats'; // Navigate to seats page
            } else if (takeOutButton.classList.contains('clicked')) {
                console.log("Take Out selected");
                window.location.href = '/payment'; // Navigate to payment page
            } else {
                console.log("Neither Dine In nor Take Out selected");
            }
        });

        // Toggle the 'clicked' class when Dine In or Take Out is clicked
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

