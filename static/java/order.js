document.addEventListener('DOMContentLoaded', function () {
    const dateFilter = document.getElementById('dateFilter');
    const statusFilter = document.getElementById('statusFilter');

    // Date Filter Functionality
    dateFilter.addEventListener('change', function () {
        const selectedDate = this.value; // Get selected date in YYYY-MM-DD format
        const orders = document.querySelectorAll('#orderList tr'); // Select all rows in the table body

        orders.forEach(order => {
            const orderDateCell = order.querySelector('.date'); // Select the date cell
            if (orderDateCell) {
                const orderDateText = orderDateCell.textContent.trim(); // Get the date from the cell

                // Parse "Wed Jan 22 2025" without timezone issues
                const [weekday, month, day, year] = orderDateText.split(' '); // Split into parts
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthIndex = monthNames.indexOf(month); // Convert month name to 0-based index

                // Format the parsed date as YYYY-MM-DD
                const formattedOrderDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Compare the formatted order date with the selected date
                if (selectedDate === '' || formattedOrderDate === selectedDate) {
                    order.style.display = ''; // Show the row
                } else {
                    order.style.display = 'none'; // Hide the row
                }
            }
        });
    });

    // Order Type Filter Functionality
    statusFilter.addEventListener('change', function () {
        const selectedStatus = this.value.toLowerCase().trim(); // Get selected order type, converted to lowercase and trimmed
        console.log("Selected Status:", selectedStatus);  // Log selected status for debugging

        const orders = document.querySelectorAll('#orderList tr'); // Select all rows in the table body

        orders.forEach(order => {
            const orderTypeCell = order.querySelector('td:nth-child(5)'); // Select the Order Type column (assuming it's the 5th column)
            if (orderTypeCell) {
                const orderType = orderTypeCell.textContent.trim().toLowerCase(); // Get the order type from the cell, converted to lowercase and trimmed
                console.log("Order Type:", orderType);  // Log each order type for debugging

                // Compare the selected order type with the row's order type
                if (selectedStatus === '' || orderType === selectedStatus) {  // Exact match
                    order.style.display = ''; // Show the row
                } else {
                    order.style.display = 'none'; // Hide the row
                }
            }
        });
    });
});
