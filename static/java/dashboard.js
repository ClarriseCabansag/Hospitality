document.addEventListener("DOMContentLoaded", function () {
    const timePeriodSelect = document.getElementById("timePeriod"); // Dropdown for time periods
    const trendingDishesChartCanvas = document.getElementById("trendingDishesChart"); // Canvas for the graph
    const dateButtons = document.querySelectorAll('.date-buttons button'); // Get all date range buttons
    const totalIncomeElement = document.querySelector('.total-income h3'); // Element to display total income
    let trendingDishesChart;

    // Function to fetch and update total income
    function fetchTotalIncome(timePeriod) {
        fetch(`/api/total-income?timePeriod=${timePeriod}`)
            .then(response => response.json())
            .then(data => {
                // Update the total income display
                totalIncomeElement.textContent = `Total Income: ₱${data.totalIncome.toLocaleString()}`;
            })
            .catch(error => console.error('Error fetching total income:', error));
    }

    // Attach click events to date buttons
    dateButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove 'active' class from all buttons
            dateButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            this.classList.add('active');
            // Fetch total income based on the button's text
            fetchTotalIncome(this.textContent.toLowerCase());
        });
    });

    // Fetch total income for "Today" on page load
    fetchTotalIncome('today');

    // Fetch total orders
    fetch('/api/total-orders')
        .then(response => response.json())
        .then(data => {
            const totalOrdersElement = document.querySelector('.total-orders .order-number');
            totalOrdersElement.textContent = data.totalOrders; // Update the order number on the page
        })
        .catch(error => console.error('Error fetching total orders:', error));

    // Fetch and render trending dishes (default: today)
    function fetchTrendingDishes(timePeriod) {
        fetch(`/api/trending-dishes?timePeriod=${timePeriod}`)
            .then(response => response.json())
            .then(data => {
                const top20Dishes = data.trendingDishes.slice(0, 20);

                const labels = top20Dishes.map(dish => dish.item_name); // Dish names
                const quantities = top20Dishes.map(dish => dish.total_quantity); // Quantities sold

                // Destroy the old chart if it exists
                if (trendingDishesChart) {
                    trendingDishesChart.destroy();
                }

                // Render the new chart
                trendingDishesChart = new Chart(trendingDishesChartCanvas.getContext("2d"), {
                    type: "bar",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Quantity Sold",
                            data: quantities,
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.raw} sold`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: "Dish Name"
                                },
                                ticks: {
                                    maxRotation: 90,
                                    minRotation: 45
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Quantity"
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            })
            .catch(error => console.error("Error fetching trending dishes:", error));
    }

    // Initial fetch for default time period (today)
    fetchTrendingDishes("today");

    // Update chart when dropdown selection changes
    timePeriodSelect.addEventListener("change", function () {
        fetchTrendingDishes(timePeriodSelect.value);
    });

    // Fetch and render daily sales data
    fetch('/api/daily-sales')
        .then(response => response.json())
        .then(data => {
            var ctx = document.getElementById('dailySalesChart').getContext('2d');
            var dailySalesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels, // Dates
                    datasets: [{
                        label: 'Daily Sales',
                        data: data.data, // Sales amount
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.2)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Sales (₱)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });

            // Handle View Report Button Click
            const viewReportButton = document.querySelector('.view-report');
            const reportModal = document.getElementById('reportModal');
            const closeModal = document.querySelector('.close');
            const salesReportBody = document.getElementById('salesReportBody');

            viewReportButton.addEventListener('click', function () {
                // Clear any previous report content
                salesReportBody.innerHTML = '';

                // Populate the modal table with daily sales data
                data.labels.forEach((date, index) => {
                    const row = document.createElement('tr');
                    const dateCell = document.createElement('td');
                    dateCell.textContent = date;
                    const salesCell = document.createElement('td');
                    salesCell.textContent = `₱${data.data[index].toLocaleString()}`;
                    row.appendChild(dateCell);
                    row.appendChild(salesCell);
                    salesReportBody.appendChild(row);
                });

                // Show the modal
                reportModal.style.display = "block";
            });

            // Close the modal when the "x" is clicked
            closeModal.addEventListener('click', function () {
                reportModal.style.display = "none";
            });

            // Close the modal if the user clicks outside of it
            window.addEventListener('click', function (event) {
                if (event.target === reportModal) {
                    reportModal.style.display = "none";
                }
            });
        })
        .catch(error => console.error('Error fetching sales data:', error));
});
