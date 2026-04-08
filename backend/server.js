import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500","https://simple-inventory-management-system.vercel.app/"]
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

const inventoryPath = path.join(__dirname, "data", "inventory.json");

if (!fs.existsSync(inventoryPath)) {
  console.error("File not found:", inventoryPath);
  console.error("Create 'backend/data/inventory.json' first.");
  process.exit(1);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

