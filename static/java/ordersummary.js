document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.menu-item img');
    const emptyCart = document.getElementById('emptyCart');
    const orderOptions = document.getElementById('orderOptions');
    const buttons = document.querySelectorAll('.order-options button');
    const orderSummary = document.getElementById('orderSummary');

    // Function to generate a unique order ID (for simplicity, using a timestamp)
    function generateOrderID() {
        return 'ORD' + Date.now();
    }

    // Function to get the current date in a readable format
    function getCurrentDate() {
        const date = new Date();
        return date.toDateString();
    }

    images.forEach(image => {
        image.addEventListener('click', function () {
            // Hide the empty cart section
            emptyCart.style.display = 'none';
            
            // Show the order options section
            orderOptions.style.display = 'block';

            // Generate order ID and get the current date
            const orderID = generateOrderID();
            const currentDate = getCurrentDate();

            // Get the parent .menu-item element
            const menuItem = this.parentElement;

            // Extract item details from the parent .menu-item element
            const itemName = menuItem.querySelector('p').textContent;
            const itemPrice = menuItem.querySelector('span').textContent;

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

            // Create controls for the item
            const controlsElement = document.createElement('div');
            controlsElement.classList.add('order-controls');
            controlsElement.innerHTML = `
                <button class="edit"><i class="fas fa-pen"></i></button>
                <button class="delete"><i class="fas fa-trash"></i></button>
                <button class="minus"><i class="fas fa-minus"></i></button>
                <button class="plus"><i class="fas fa-plus"></i></button>
            `;

            // Append item details and controls to the item container
            itemContainer.appendChild(itemElement);
            itemContainer.appendChild(controlsElement);

            // Clear previous summary and append new details
            orderSummary.innerHTML = '';
            orderSummary.appendChild(orderContainer); // Append the order ID and date container
            orderSummary.appendChild(itemContainer); // Append the item details and controls
        });
    });

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove the 'clicked' class from all buttons
            buttons.forEach(btn => btn.classList.remove('clicked'));
            
            // Add the 'clicked' class to the clicked button
            this.classList.add('clicked');
        });
    });
});
