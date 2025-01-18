// Daily Sales Chart
const ctx = document.getElementById('dailySalesChart').getContext('2d');
const dailySalesChart = new Chart(ctx, {
    type: 'bar', // Bar chart
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // X-axis labels
        datasets: [{
            label: 'Sales',
            data: [1200, 1900, 3000, 5000, 2400, 7000, 8000], // Sales data
            backgroundColor: [
                '#3498db',
                '#1abc9c',
                '#9b59b6',
                '#f1c40f',
                '#e67e22',
                '#e74c3c',
                '#2ecc71'
            ],
            borderColor: [
                '#2980b9',
                '#16a085',
                '#8e44ad',
                '#f39c12',
                '#d35400',
                '#c0392b',
                '#27ae60'
            ],
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
            title: {
                display: true,
                text: 'Daily Sales'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
