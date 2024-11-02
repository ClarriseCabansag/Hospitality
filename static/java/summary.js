// summary.js

document.addEventListener('DOMContentLoaded', function() {
    const rows = document.querySelectorAll('.clickable-row');

    rows.forEach(row => {
        row.addEventListener('click', function() {
            const cashierId = this.getAttribute('data-id');
            window.location.href = `/cashier_detail/${cashierId}`;
        });
    });
});
