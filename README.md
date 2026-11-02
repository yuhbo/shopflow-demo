# ShopFlow Demo

English clickable demo for light manufacturing:

**Materials → Routings → Work Orders → Shop Floor reporting → Inventory**

Single-plant demo mode (no multi-tenant login). Data is stored in a real **SQLite** file via Node’s built-in `node:sqlite` (Node ≥ 22.5). No cloud account required to run locally.

## Quick start

```bash
cd shopflow-demo
npm install
npm start
```

Open **http://localhost:3847**

| Script | Purpose |
|--------|---------|
| `npm start` | Run server (port **3847**, or `PORT` env) |
| `npm run dev` | Same with `--watch` reload |
| `npm run seed` | Delete DB and re-seed sample data |

### Data file

- Default path: `data/shopflow.db` (created on first start)
- Override: `DB_PATH=/absolute/path/to/file.db npm start`

## Pages

| Path | Module |
|------|--------|
| `/` | Dashboard — WO progress, low stock, recent movements |
| `/materials.html` | Materials master (SKU, unit, on-hand) |
| `/routings.html` | Routings + ordered operations |
| `/work-orders.html` | Work orders — create, view ops, **Release** |
| `/shop` | Shop Floor — scan / Start / Complete |
| `/inventory.html` | On-hand + issue / receipt / adjust |

## Seed data (first run)

| Kind | Examples |
|------|----------|
| Materials | `RM-AL6061`, `RM-SS304`, `FG-BRACKET`, `FG-SHAFT`, `RM-FASTENER` |
| Routings | `RT-BRACKET` (4 ops), `RT-SHAFT` (5 ops) |
| Work orders | `WO-1001` released · `WO-1002` in progress · `WO-1003` draft |

Suggested click path (no coding):

1. **Work Orders** → open `WO-1003` → **Release**
2. **Shop Floor** → scan `WO-1001` (or click **Load in scan**)
3. **Start** then **Complete** each operation (qty good defaults to planned qty)
4. On the last op complete, finished goods are **received** into inventory
5. **Inventory** / **Dashboard** — confirm on-hand and movement history

Optional material **issue** can be entered on the Complete dialog.

Scan string formats: `WO-1001` · `WO-1001:OP20`

## Stack

- Node.js + Express
- SQLite via `node:sqlite` (`DatabaseSync`) — **no native compile**
- Static HTML + CSS + `fetch` (no heavy SPA framework)

## Deploy (free tiers, short)

Any Node host that can keep a writable disk (or mount a volume) works.

### Render

1. New **Web Service** from this folder  
2. Build: `npm install`  
3. Start: `npm start`  
4. Add disk or set `DB_PATH` to a persistent path if the free instance is ephemeral  

### Railway / Fly.io

- Start command: `npm start`
- Set `PORT` is provided by the platform (app already reads `process.env.PORT`)
- Attach a volume and point `DB_PATH` at it so SQLite survives restarts

Example Dockerfile sketch:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=3847
CMD ["npm", "start"]
```

> Free dynos often wipe local disk on restart. For a durable demo, use a volume **or** move to Postgres (below).

## Later: swap SQLite → Neon / Supabase (Postgres)

This demo keeps SQL close to standard so migration is straightforward.

1. Create a free project at [Neon](https://neon.tech) or [Supabase](https://supabase.com); copy the Postgres URL.  
2. Add `pg` (`npm install pg`).  
3. Replace `src/db.js` open/seed with a Postgres pool; map types (`REAL`→`DOUBLE PRECISION`, `datetime('now')`→`NOW()`, etc.).  
4. Keep the same Express routes; only the data-access layer changes.  
5. Set `DATABASE_URL` in the host env; remove dependence on `data/shopflow.db`.

Minimal mental model:

| Today (SQLite file) | Later (Neon/Supabase) |
|---------------------|------------------------|
| `data/shopflow.db` | `DATABASE_URL` |
| Zero cloud signup | Free Postgres tier |
| Great for laptop demo | Better for multi-user hosted demo |

You do **not** need Postgres to validate the product walkthrough locally.

## Out of scope (P0)

Native apps, Stripe, multi-tenant auth, full MRP, non-English UI.

## License

MIT
