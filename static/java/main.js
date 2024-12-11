document.addEventListener("DOMContentLoaded", () => {
  // Select all submenu items
  const submenuItems = document.querySelectorAll(".submenu_item");

  // Add click event listener to each submenu item
  submenuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Toggle the submenu visibility
      const submenu = item.nextElementSibling;
      submenu.classList.toggle("show");

      // Rotate the arrow icon
      const arrow = item.querySelector(".arrow-left");
      arrow.classList.toggle("rotate");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
    const submenuItems = document.querySelectorAll(".submenu_item");

    submenuItems.forEach((item) => {
        item.addEventListener("click", () => {
            const url = item.getAttribute("data-url");
            loadContent(url);
        });
    });

    function loadContent(url) {
        const contentArea = document.getElementById("content-area");

        // Clear the current content
        contentArea.innerHTML = "<p>Loading...</p>";

        // Fetch the new content using AJAX
        fetch(url)
            .then((response) => response.text())
            .then((data) => {
                contentArea.innerHTML = data; // Insert the loaded content into the page
            })
            .catch((error) => {
                contentArea.innerHTML = "<p>Sorry, an error occurred while loading the content.</p>";
                console.error("Error loading content:", error);
            });
    }
});
