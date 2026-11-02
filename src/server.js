'use strict';

const path = require('path');
const express = require('express');
const { openDatabase } = require('./db');
const { registerRoutes } = require('./routes');

const PORT = Number(process.env.PORT) || 3847;
const { db, path: dbPath, seeded } = openDatabase();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

registerRoutes(app, db);

app.get('/shop', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'shop.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ShopFlow demo listening on http://localhost:${PORT}`);
  console.log(`SQLite file: ${dbPath}`);
  if (seeded) console.log('Seed data loaded (first run).');
  console.log('Pages: /  /materials.html  /routings.html  /work-orders.html  /shop  /inventory.html');
});
