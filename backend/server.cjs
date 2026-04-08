const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000", "https://simple-inventory-management-system.vercel.app/"]
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

const inventoryPath = path.join(__dirname, "data", "inventory.json");
const suppliersPath = path.join(__dirname, "data", "suppliers.json");

let inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
let suppliers = JSON.parse(fs.readFileSync(suppliersPath, "utf-8"));

function saveSuppliers() {
  fs.writeFileSync(suppliersPath, JSON.stringify(suppliers, null, 2));
}

function saveInventory() {
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
}

function getNextSupplierId() {
  if (suppliers.length === 0) return 1;
  return Math.max(...suppliers.map(s => s.id)) + 1;
}

function getNextInventoryId() {
  if (inventory.length === 0) return 1;
  return Math.max(...inventory.map(i => i.id || 0)) + 1;
}

app.get("/suppliers", (req, res) => {
  res.json(suppliers);
});

app.post("/supplier", (req, res) => {
  const { name, city } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name required" });
  }
  const newSupplier = {
    id: getNextSupplierId(),
    name,
    city: city || ""
  };
  suppliers.push(newSupplier);
  saveSuppliers();
  res.json(newSupplier);
});

app.post("/inventory", (req, res) => {
  const { productName, category, quantity, price, supplierId } = req.body;
  if (!productName || !category || !quantity || !price || !supplierId) {
    return res.status(400).json({ message: "All fields required" });
  }
  const supplier = suppliers.find(s => s.id === Number(supplierId));
  if (!supplier) {
    return res.status(400).json({ message: "Invalid supplier ID" });
  }
  const newItem = {
    id: getNextInventoryId(),
    productName,
    category,
    quantity: Number(quantity),
    price: Number(price),
    supplier: supplier.name
  };
  inventory.push(newItem);
  saveInventory();
  res.json(newItem);
});

app.get("/search", (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query;

  let results = [...inventory];

  if (q) {
    results = results.filter(item =>
      item.productName.toLowerCase().includes(q.trim().toLowerCase())
    );
  }

  if (category) {
    results = results.filter(item => item.category === category);
  }

  const min = minPrice !== undefined ? Number(minPrice) : -Infinity;
  const max = maxPrice !== undefined ? Number(maxPrice) : Infinity;

  if (minPrice !== undefined && maxPrice !== undefined && min > max) {
    return res.status(400).json({ message: "Invalid price range" });
  }

  results = results.filter(item => item.price >= min && item.price <= max);

  res.json(results);
});

app.get("/by-supplier", (req, res) => {
  const bySupplier = suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    city: supplier.city,
    items: inventory.filter(item => item.supplier === supplier.name)
      .map(item => ({
        productName: item.productName,
        category: item.category,
        quantity: item.quantity || 0,
        price: item.price
      }))
      .filter(item => item.quantity > 0)
  })).filter(supplier => supplier.items.length > 0);

  res.json(bySupplier.sort((a, b) => {
    const totalA = a.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalB = b.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return totalB - totalA;
  }));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

