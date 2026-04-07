// Global data cache
let suppliersCache = [];
let inventoryCache = [];

// === TABS ===
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(tc => tc.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(targetId)?.classList.add("active");
  });
});

// === SUPPLIER FORM ===
const supplierForm = document.getElementById("supplierForm");
const supplierList = document.getElementById("supplierList");

async function loadSuppliers() {
  try {
    const res = await fetch("https://simple-inventory-management-system-6d6e.onrender.com/suppliers");
    suppliersCache = await res.json();
    renderSuppliers();
    populateSupplierDropdown();
  } catch (err) {
    supplierList.innerHTML = '<p class="no-results">Error loading suppliers: ' + err.message + '</p>';
  }
}

function renderSuppliers() {
  let html = "<h3>Suppliers</h3>";
  if (suppliersCache.length === 0) {
    html += '<p class="no-results">No suppliers found.</p>';
  } else {
    html += "<table><thead><tr><th>ID</th><th>Name</th><th>City</th></tr></thead><tbody>";
    suppliersCache.forEach(supplier => {
      html += '<tr><td>' + supplier.id + '</td><td>' + supplier.name + '</td><td>' + supplier.city + '</td></tr>';
    });
    html += "</tbody></table>";
  }
  supplierList.innerHTML = html;
}

supplierForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("supplierName").value.trim();
  const city = document.getElementById("supplierCity").value.trim();

  try {
    const res = await fetch("https://simple-inventory-management-system-6d6e.onrender.com/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city })
    });
    const newSupplier = await res.json();

    if (!res.ok) {
      supplierList.innerHTML = '<p class="no-results">' + newSupplier.message + '</p>';
      return;
    }

    // Refresh
    await loadSuppliers();
    document.getElementById("supplierForm").reset();
    supplierList.innerHTML += '<p class="success">Supplier added successfully!</p>';
  } catch (err) {
    supplierList.innerHTML = '<p class="no-results">Network error: ' + err.message + '</p>';
  }
});

loadSuppliers();

const supplierSelect = document.getElementById("supplierSelect");

function populateSupplierDropdown() {
  supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
  suppliersCache.forEach(supplier => {
    supplierSelect.innerHTML += '<option value="' + supplier.id + '">' + supplier.name + ' (' + supplier.city + ')</option>';
  });
}

// === INVENTORY FORM ===
const inventoryForm = document.getElementById("inventoryForm");
const inventoryList = document.getElementById("inventoryList");

inventoryForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productName = document.getElementById("productName").value.trim();
  const category = document.getElementById("inventoryCategory").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("inventoryPrice").value;
  const supplierId = document.getElementById("supplierSelect").value;

  try {
    const res = await fetch("https://simple-inventory-management-system-6d6e.onrender.com/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, category, quantity, price, supplierId })
    });
    const newItem = await res.json();

    if (!res.ok) {
      inventoryList.innerHTML = '<p class="no-results">' + newItem.message + '</p>';
      return;
    }

    inventoryList.innerHTML += '<p class="success">Item added: ' + newItem.productName + '</p>';
    inventoryForm.reset();
  } catch (err) {
    inventoryList.innerHTML = '<p class="no-results">Network error: ' + err.message + '</p>';
  }
});

// === SEARCH SECTION ===
const searchForm = document.getElementById("searchForm");
const searchResults = document.getElementById("results");

searchForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const q = document.getElementById("q").value.trim();
  const category = document.getElementById("category").value.trim();
  const minPrice = document.getElementById("minPrice").value.trim();
  const maxPrice = document.getElementById("maxPrice").value.trim();

  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (category) params.append("category", category);
  if (minPrice !== "") params.append("minPrice", minPrice);
  if (maxPrice !== "") params.append("maxPrice", maxPrice);

  searchResults.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("https://simple-inventory-management-system-6d6e.onrender.com/search?" + params.toString());
    const data = await res.json();

    if (!res.ok) {
      searchResults.innerHTML = '<p class="no-results">' + (data.message || "Error occurred.") + '</p>';
      return;
    }

    if (data.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No results found.</p>';
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
    `;
    data.forEach(item => {
      html += `
        <tr>
          <td>` + item.productName + `</td>
          <td>` + item.category + `</td>
          <td>₹` + item.price + `</td>
          <td>` + item.supplier + `</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;

    searchResults.innerHTML = html;
  } catch (err) {
    searchResults.innerHTML = '<p class="no-results">Network error: ' + err.message + '</p>';
  }
});

// === BY SUPPLIER SECTION ===
const supplierInventoryReport = document.getElementById("supplierInventoryReport");

function renderBySupplier(data) {
  if (!Array.isArray(data) || data.length === 0) {
    supplierInventoryReport.innerHTML = '<p class="no-results">No supplier inventory data available.</p>';
    return;
  }

  let html = '<div class="supplier-group">';

  data.forEach(supplier => {
    const totalValue = supplier.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    html += `
      <div class="supplier-card">
        <div class="supplier-header">
          <div class="supplier-info">
            <h4>` + supplier.name + `</h4>
            <span class="supplier-city">` + supplier.city + ` • ` + supplier.items.length + ` items</span>
          </div>
          <div class="supplier-total">
            Total Value: ₹` + totalValue.toLocaleString() + `
          </div>
        </div>
        
        <div class="supplier-items">
    `;

    supplier.items.forEach(item => {
      const itemValue = item.quantity * item.price;
      html += `
        <div class="item-row">
          <span class="item-name">` + item.productName + `</span>
          <span class="item-category">` + item.category + `</span>
          <span class="item-qty">` + item.quantity + `</span>
          <span class="item-price">₹` + item.price.toLocaleString() + `</span>
          <span class="item-value">₹` + itemValue.toLocaleString() + `</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += '</div>';
  supplierInventoryReport.innerHTML = html;
}

async function loadInventoryBySupplier() {
  try {
    const res = await fetch("https://simple-inventory-management-system-6d6e.onrender.com/by-supplier");
    const data = await res.json();
    renderBySupplier(data);
  } catch (err) {
    supplierInventoryReport.innerHTML = '<p class="no-results">Error loading data: ' + err.message + '</p>';
  }
}

document.querySelector('[data-tab="by-supplier"]')?.addEventListener("click", loadInventoryBySupplier);

