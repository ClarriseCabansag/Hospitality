document.addEventListener("DOMContentLoaded", () => {
    const inventoryTable = document.getElementById("inventory-table");

    fetch("/api/inventory_data")
        .then((response) => response.json())
        .then((data) => {
            if (data.length > 0) {
                // Sort data by date (assuming 'date' format is '10 December 2024')
                data.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateA - dateB;
                });

                inventoryTable.innerHTML = "";
                data.forEach((item) => {
                    const row = document.createElement("tr");

                    const uoiCell = document.createElement("td");
                    uoiCell.textContent = item.uoi;

                    const itemCell = document.createElement("td");
                    itemCell.textContent = item.item;

                    const stockCell = document.createElement("td");
                    stockCell.textContent = item.ending;

                    const dateCell = document.createElement("td");
                    dateCell.textContent = item.date;

                    row.appendChild(uoiCell);
                    row.appendChild(itemCell);
                    row.appendChild(stockCell);
                    row.appendChild(dateCell);

                    inventoryTable.appendChild(row);
                });
            } else {
                inventoryTable.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">No data available</td>
                    </tr>
                `;
            }
        })
        .catch((error) => {
            console.error("Error fetching inventory data:", error);
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">Error loading data</td>
                </tr>
            `;
        });
});
