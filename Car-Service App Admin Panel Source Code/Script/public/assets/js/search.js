// Initiate Search Filter
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector('[data-kt-list-table="search"]');
    const tableRows = document.querySelectorAll("#list-table tbody tr, #bannerlist-table tbody tr");

    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.trim().toLowerCase();

        tableRows.forEach(function (row) {
            const rowData = row.textContent.trim().toLowerCase();
            if (rowData.includes(searchTerm)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
});