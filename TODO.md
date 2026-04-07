# Task Progress: Simple Inventory Search Feature

**Completed:**
- [x] Fixed ESM/CommonJS backend/server.cjs (npm start works)
- [x] Fixed CORS for Live Server (127.0.0.1:5500)
- [x] Fixed search 404 → absolute `http://localhost:3000/search`
- [x] Added /by-supplier endpoint (groups real inventory.json by suppliers.json)
- [x] By Supplier tab fetches backend data

**Remaining:**
- [ ] Add supplier form → POST /supplier → list
- [ ] Inventory form → dropdown from GET /suppliers → POST /inventory
- [ ] Auto-refresh By Supplier after adds
- [ ] Test full CRUD flow

Run backend: `npm start` in backend/
Open public/index.html with Live Server

