document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');

    toggleBtn.addEventListener('click', function() {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.add('expanded');
            toggleBtn.innerHTML = '<i class="fas fa-angle-double-right"></i>';
        } else {
            sidebar.classList.remove('expanded');
            sidebar.classList.add('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-angle-double-left"></i>';
        }
    });

});
