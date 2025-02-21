document.addEventListener('DOMContentLoaded', function () {
    const dateFilter = document.getElementById('dateFilter');
    const statusFilter = document.getElementById('statusFilter');

    // Function to format time properly
    function formatTime(dateString) {
        const date = new Date(dateString); // Convert to Date object
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format
        minutes = minutes.toString().padStart(2, '0'); // Ensure two-digit minutes
        return `${hours}:${minutes} ${ampm}`;
    }

    // Function to update time to current time
    function updateOrderTimes() {
        const orders = document.querySelectorAll('#orderList tr');

        orders.forEach(order => {
            const timeCell = order.querySelector('td:nth-child(4)'); // Select the time column (assuming 4th column)
            if (timeCell) {
                const currentTime = new Date();
                timeCell.textContent = formatTime(currentTime);
            }
        });
    }

    // Apply current time when the page loads
    updateOrderTimes();

    // Date Filter Functionality
    dateFilter.addEventListener('change', function () {
        const selectedDate = this.value;
        const orders = document.querySelectorAll('#orderList tr');

        orders.forEach(order => {
            const orderDateCell = order.querySelector('.date');
            if (orderDateCell) {
                const orderDateText = orderDateCell.textContent.trim();

                // Convert the date from "Wed Jan 22 2025" format
                const [weekday, month, day, year] = orderDateText.split(' ');
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthIndex = monthNames.indexOf(month);

                const formattedOrderDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                if (selectedDate === '' || formattedOrderDate === selectedDate) {
                    order.style.display = '';
                } else {
                    order.style.display = 'none';
                }
            }
        });
    });

    // Order Type Filter Functionality
    statusFilter.addEventListener('change', function () {
        const selectedStatus = this.value.toLowerCase().trim();
        const orders = document.querySelectorAll('#orderList tr');

        orders.forEach(order => {
            const orderTypeCell = order.querySelector('td:nth-child(5)');
            if (orderTypeCell) {
                const orderType = orderTypeCell.textContent.trim().toLowerCase();
                if (selectedStatus === '' || orderType === selectedStatus) {
                    order.style.display = '';
                } else {
                    order.style.display = 'none';
                }
            }
        });
    });

});
