document.addEventListener("DOMContentLoaded", async () => {
    const addDishBtn = document.querySelector(".add-dish-btn");
    const modal = document.getElementById("addDishModal");
    const closeBtn = document.querySelector(".close");
    const form = document.getElementById("addDishForm");
    const editModal = document.getElementById("editDishModal");
    const editCloseBtn = document.querySelector("#editDishModal .close");
    const editForm = document.getElementById("editDishForm");
    const dropdown = document.querySelector(".ingredients-dropdown");
    const selectedText = document.getElementById("selectedIngredients");
    const tableBody = document.querySelector("#inventoryTableBody");
    const selectBox = document.querySelector(".select-box");
    const priceInput = document.getElementById("price");

    let currentDishId = null;

    // Global map to store ingredient quantities
    const ingredientQuantities = {};

    // Function to format price input dynamically without limiting digits
    function formatPriceInput(value) {
        let num = value.replace(/[^\d.]/g, ""); // Remove non-numeric characters except "."
        let parts = num.split(".");

        if (parts.length > 2) {
            num = parts[0] + "." + parts.slice(1).join(""); // Prevent multiple decimals
        }

        let [whole, decimal] = num.split(".");
        decimal = decimal ? decimal.slice(0, 2) : ""; // Allow up to 2 decimal places

        return decimal ? `${whole}.${decimal}` : whole; // Show decimals only if entered
    }

    // Apply price formatting when typing
    priceInput.addEventListener("input", (e) => {
        let cursorPosition = e.target.selectionStart;
        let originalLength = e.target.value.length;

        let formattedValue = formatPriceInput(e.target.value);
        e.target.value = formattedValue;

        let newLength = formattedValue.length;
        e.target.selectionStart = e.target.selectionEnd = cursorPosition + (newLength - originalLength);
    });

    async function fetchAndDisplayDishes() {
        try {
            const [dishesResponse, ingredientsResponse] = await Promise.all([
                fetch("/get_dishes"),
                fetch("/get_ingredients")
            ]);

            const dishes = await dishesResponse.json();
            const ingredients = await ingredientsResponse.json();

            console.log("Fetched Ingredients (Raw):", ingredients);

            const ingredientStockMap = {};
            ingredients.forEach(ing => {
                console.log(`Mapping Ingredient: ${ing.item} → Stock: ${ing.stock}`);
                ingredientStockMap[ing.item.trim()] = parseInt(ing.stock, 10) || 0; // Ensure it's a number
            });

            console.log("Final Ingredient Stock Map:", ingredientStockMap);

            tableBody.innerHTML = "";
            dishes.forEach(dish => addDishToTable(dish, ingredientStockMap));
        } catch (error) {
            console.error("Error fetching dishes or ingredients:", error);
        }
    }

async function fetchIngredients() {
    try {
        const response = await fetch("/get_ingredients");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid data format");

        dropdown.innerHTML = "";

        // Create a search box
        const searchBox = document.createElement("input");
        searchBox.type = "text";
        searchBox.placeholder = "Search ingredients...";
        searchBox.classList.add("ingredient-search");
        searchBox.addEventListener("input", filterIngredients);

        dropdown.appendChild(searchBox); // Add search box at the top

        // Create a container for ingredients
        const ingredientsContainer = document.createElement("div");
        ingredientsContainer.classList.add("ingredients-list");

        data.forEach(item => {
            const label = document.createElement("label");
            label.classList.add("ingredient-item");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = item.item;
            checkbox.addEventListener("change", (e) => updateSelectedIngredients(e, item.item));

            const ingredientName = document.createElement("span");
            ingredientName.textContent = item.item;
            ingredientName.classList.add("ingredient-name");

            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.min = "1";
            quantityInput.value = "1";
            quantityInput.classList.add("ingredient-quantity");
            quantityInput.addEventListener("input", () => updateSelectedIngredients(null, item.item));

            label.appendChild(checkbox);
            label.appendChild(ingredientName);
            label.appendChild(quantityInput);
            ingredientsContainer.appendChild(label);
        });

        dropdown.appendChild(ingredientsContainer);
        dropdown.style.display = "none";
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        dropdown.innerHTML = "<p>Error loading ingredients</p>";
    }
}


   async function fetchIngredientsForEdit(dishId) {
    try {
        const response = await fetch("/get_ingredients");
        const ingredients = await response.json();

        const editDropdown = document.getElementById("editIngredientsDropdown");
        editDropdown.innerHTML = "";
        ingredients.forEach(item => {
            const label = document.createElement("label");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = item.item;
            checkbox.checked = currentDishId.ingredients.includes(item.item);
            checkbox.addEventListener("change", updateSelectedIngredientsForEdit);

            const ingredientName = document.createElement("span");
            ingredientName.textContent = item.item;

            // Create quantity input
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.min = "1"; // Minimum quantity
            quantityInput.value = ingredientQuantities[item.item] || 1; // Default to 1
            quantityInput.style.width = "60px"; // Adjust size
            quantityInput.addEventListener("input", (e) => updateIngredientQuantityForEdit(item.item, e.target.value));

            const itemContainer = document.createElement("div");
            itemContainer.classList.add("ingredient-item");

            itemContainer.appendChild(checkbox);
            itemContainer.appendChild(ingredientName);
            itemContainer.appendChild(quantityInput); // Append the quantity input

            label.appendChild(itemContainer);
            editDropdown.appendChild(label);
        });
    } catch (error) {
        console.error("Error fetching ingredients:", error);
    }
}

function filterIngredients(event) {
    const searchValue = event.target.value.toLowerCase();
    const ingredientItems = document.querySelectorAll(".ingredient-item");

    ingredientItems.forEach(item => {
        const ingredientName = item.querySelector(".ingredient-name").textContent.toLowerCase();
        if (ingredientName.includes(searchValue)) {
            item.style.display = "flex"; // Show if it matches
        } else {
            item.style.display = "none"; // Hide if it doesn’t match
        }
    });
}


function updateSelectedIngredients(event, ingredientName) {
    const checkboxes = dropdown.querySelectorAll("input[type='checkbox']:checked");
    const selectedValues = [];

    checkboxes.forEach(cb => {
        const quantityInput = cb.closest(".ingredient-item").querySelector(".ingredient-quantity");
        const quantity = quantityInput ? quantityInput.value : "1";
        selectedValues.push(`${quantity}pcs ${cb.value}`);
    });

    selectedText.textContent = selectedValues.length ? selectedValues.join(", ") : "Select Ingredients";
}

function updateSelectedIngredientsForEdit() {
    const selectedValues = Array.from(document.getElementById("editIngredientsDropdown").querySelectorAll("input:checked"))
        .map(cb => {
            const quantityInput = cb.closest(".ingredient-item").querySelector(".ingredient-quantity");
            const quantity = quantityInput ? quantityInput.value : "1";
            return `${quantity}pcs ${cb.value}`;
        });

    document.getElementById("editSelectedIngredients").textContent = selectedValues.length ? selectedValues.join(", ") : "Select Ingredients";
}



    // Toggle ingredient dropdown
selectBox.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click event from bubbling
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
});

// Prevent dropdown from closing when interacting with quantity input
dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
});


    // Open modal to add dish
    addDishBtn.addEventListener("click", () => {
        modal.style.display = "block";
        fetchIngredients();
    });

    // Close modals
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    editCloseBtn.addEventListener("click", () => {
        editModal.style.display = "none";
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
        if (e.target === editModal) {
            editModal.style.display = "none";
        }
    });

   form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate form inputs
    const category = document.getElementById("category").value;
    const name = document.getElementById("dishName").value.trim();
    const price = document.getElementById("price").value.trim();
    const ingredients = Array.from(dropdown.querySelectorAll("input:checked"));
    const imageUpload = document.getElementById("imageUpload").files[0];

    if (!category || !name || !price || ingredients.length === 0 || !imageUpload) {
        alert("All fields, including an image, are required!");
        return;
    }

    // Fetch existing dishes
    try {
        const dishesResponse = await fetch("/get_dishes");
        const dishes = await dishesResponse.json();

        // Check for duplicate name (case-insensitive)
        const isDuplicate = dishes.some(dish => dish.name.toLowerCase() === name.toLowerCase());

        if (isDuplicate) {
            alert("Dish name already exists! Please choose a different name.");
            modal.style.display = "none"; // Close modal
            form.reset();
            selectedText.textContent = "Select Ingredients";
            fetchAndDisplayDishes(); // Refresh dishes
            return;
        }

        // Proceed with dish addition if no duplicate
        const formData = new FormData();
        formData.append("category", category);
        formData.append("name", name);
        formData.append("price", price);
        formData.append("image", imageUpload);

        const selectedIngredients = ingredients.map(cb => {
            const quantityInput = cb.closest(".ingredient-item").querySelector(".ingredient-quantity");
            const quantity = quantityInput ? quantityInput.value : "1";
            return `${quantity} pcs ${cb.value}`;
        });

        selectedIngredients.forEach(ingredient => formData.append("ingredients", ingredient));

        const response = await fetch("/add_dish", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert("Dish added successfully!");
            modal.style.display = "none";
            form.reset();
            selectedText.textContent = "Select Ingredients";
            fetchAndDisplayDishes();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error("Error checking for duplicate dishes:", error);
    }
});


    // Handle form submission to edit a dish
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category", document.getElementById("editCategory").value);
    formData.append("name", document.getElementById("editDishName").value);
    formData.append("price", document.getElementById("editPrice").value);

    // Collect selected ingredients
    const selectedIngredients = Array.from(document.getElementById("editIngredientsDropdown").querySelectorAll("input:checked"))
        .map(cb => cb.value);
    selectedIngredients.forEach(ingredient => formData.append("ingredients", ingredient));

    const imageUpload = document.getElementById("editImageUpload").files[0];
    if (imageUpload) {
        formData.append("image", imageUpload);
    }

    try {
        const response = await fetch(`/update_dish/${currentDishId}`, {
            method: "PUT",
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert("Dish updated successfully!");
            editModal.style.display = "none";
            fetchAndDisplayDishes();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error("Error updating dish:", error);
    }
});


    // Delete dish from the table and database
    async function deleteDish(dishId) {
    if (!confirm("Are you sure you want to delete this dish?")) {
            return;
        }
        try {
            const response = await fetch(`/delete_dish/${dishId}`, {
                method: "DELETE",
            });

            const result = await response.json();
            if (response.ok) {
                alert("Dish deleted successfully!");
                fetchAndDisplayDishes();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error deleting dish:", error);
        }
    }

    // Open edit modal and load data
    function openEditModal(dish) {
        currentDishId = dish.id;
        document.getElementById("editCategory").value = dish.category;
        document.getElementById("editDishName").value = dish.name;
        document.getElementById("editPrice").value = dish.price;
        document.getElementById("editSelectedIngredients").textContent = dish.ingredients.join(", ");

        fetchIngredientsForEdit(dish.id);

        editModal.style.display = "block";
    }

function addDishToTable(dish, ingredientStockMap) {
    let dishStock = "N/A";

    if (typeof dish.ingredients === "string") {
        dish.ingredients = dish.ingredients.split(",").map(ing => ing.trim());
    }

    if (dish.ingredients.length > 0) {
        let stockValues = dish.ingredients.map(ingredient => {
            let parts = ingredient.match(/^(\d+)\s*pcs\s*(.+)$/i); // Extract quantity and ingredient name
            let quantity = parts ? parts[1] : "1"; // Default quantity
            let cleanIngredient = parts ? parts[2] : ingredient; // Ingredient name

            let stock = ingredientStockMap[cleanIngredient] !== undefined ? ingredientStockMap[cleanIngredient] : 0;
            return { ingredient: cleanIngredient, quantity, stock };
        });

        dishStock = stockValues.length ? Math.min(...stockValues.map(item => item.stock)) : 0;
    }

    const dishRow = document.createElement("tr");
    dishRow.innerHTML = `
        <td>${dish.id}</td>
        <td>${dish.category || ""}</td>
        <td>${dish.name}</td>
        <td>${dishStock}</td>
        <td>₱${parseFloat(dish.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td><img src="${dish.image_url}" class="img-fluid" width="50"></td>
        <td>
            <i class="fa-solid fa-pen-to-square edit-dish" data-id="${dish.id}"></i>
            <i class="fa-solid fa-trash delete-dish" data-id="${dish.id}"></i>
        </td>
    `;
    tableBody.appendChild(dishRow);

    // Attach delete functionality
    dishRow.querySelector(".delete-dish").addEventListener("click", () => {
        deleteDish(dish.id);
    });

    // Attach edit functionality
    dishRow.querySelector(".edit-dish").addEventListener("click", () => {
        openEditModal(dish);
    });

    // Display ingredients and quantities in the table
    if (dish.ingredients.length > 0) {
        dish.ingredients.forEach(ingredient => {
            let parts = ingredient.match(/^(\d+)\s*pcs\s*(.+)$/i); // Extract quantity and name
            let quantity = parts ? parts[1] : "1"; // Default quantity
            let cleanIngredient = parts ? parts[2] : ingredient; // Ingredient name

            const ingredientRow = document.createElement("tr");
            ingredientRow.innerHTML = `
                <td></td>
                <td></td>
                <td colspan="1" class="ingredient-row">➜ ${quantity} pcs ${cleanIngredient}</td>
                <td>${ingredientStockMap[cleanIngredient] || 0}</td>
                <td></td>
                <td></td>
                <td></td>
            `;
            tableBody.appendChild(ingredientRow);
        });
    }
}

    // Load dishes when the page loads
    fetchAndDisplayDishes();
});
