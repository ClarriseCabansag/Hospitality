document.addEventListener('DOMContentLoaded', function() {
    // Handle sidebar toggle
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');
    const menuText = document.querySelectorAll('.menu-text');

    toggleBtn.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent event from bubbling up

        sidebar.classList.toggle('collapsed');
        
        menuText.forEach(function(text) {
            text.classList.toggle('hidden');
        });

        // Toggle the icon direction
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.innerHTML = '<i class="fas fa-angle-double-left"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-angle-double-right"></i>';
        }
    });

    // Handle category button clicks
    const categoryButtons = document.querySelectorAll('.category');
    const menuItems = document.querySelectorAll('.menu-items');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the category ID from button text
            const categoryId = this.textContent.trim().toLowerCase().replace(/ /g, '-');

            // Hide all menu items
            menuItems.forEach(item => {
                item.style.display = 'none';
            });

            // Show the selected category's menu items
            const selectedItem = document.getElementById(categoryId);
            if (selectedItem) {
                selectedItem.style.display = 'block';
            }
        });
    });
});
