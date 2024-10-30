document.addEventListener('DOMContentLoaded', function() {
    // Toggle Sidebar
    document.getElementById('toggleBtn').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        
        if (sidebar.classList.contains('collapsed')) {
            document.querySelector('.container').style.marginLeft = '70px';
        } else {
            document.querySelector('.container').style.marginLeft = '250px';
        }
    });

    // Tab Switching Functionality
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Edit Order Function (Placeholder)
    function editOrder() {
        const passcode = prompt("Enter manager passcode:");
        if (passcode === "1234") { // Example passcode, should be handled securely in production
            alert("You can now edit the order.");
        } else {
            alert("Incorrect passcode.");
        }
    }

    // Delete Order Function (Placeholder)
    function deleteOrder() {
        alert("Delete order functionality not yet implemented.");
    }

    // Handle Date Filter
    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', function() {
        const selectedDate = this.value;
        const orders = document.querySelectorAll('.order-item');
        orders.forEach(order => {
            const orderDate = order.querySelector('.date').textContent;
            if (selectedDate === '' || orderDate === selectedDate) {
                order.style.display = 'grid'; // Show the order
            } else {
                order.style.display = 'none'; // Hide the order
            }
        });
    });

    // Handle Status Filter
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', function() {
        const selectedStatus = this.value;
        const orders = document.querySelectorAll('.order-item');
        orders.forEach(order => {
            const orderStatus = order.querySelector('.status').textContent;
            if (selectedStatus === '' || orderStatus === selectedStatus) {
                order.style.display = 'grid'; // Show the order
            } else {
                order.style.display = 'none'; // Hide the order
            }
        });
    });
});

