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
