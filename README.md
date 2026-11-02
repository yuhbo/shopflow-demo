# ShopFlow Demo

Chinese-first clickable demo (English toggle in the header) for light manufacturing:

**Materials → Routings → Work Orders → Shop Floor reporting → Inventory**

Single-plant demo mode (no multi-tenant login). Data is stored in a real **SQLite** file via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (Node ≥ 18). No cloud account required to run locally.

## Quick start

```bash
cd shopflow-demo
npm install
npm start
```

Open **http://localhost:3847**

The UI defaults to **中文**. **中文 / English** in the header switches every page and is stored in `localStorage` as `shopflow_lang`. Demo prices on the dashboard are illustrative only: about **$30–$55 per plant / month** (Starter about $35, Growth about $55), shown in Chinese as **约 ¥220–¥400/厂/月** at roughly 7.2 CNY per USD. There is no checkout.

| Script | Purpose |
|--------|---------|
| `npm start` | Run server (port **3847**, or `PORT` env) |
| `npm run dev` | Same with `--watch` reload |
| `npm run seed` | Delete DB and re-seed sample data |

### Data file

- Local default: `data/shopflow.db` (created on first start)
- When `RENDER` is set, or `NODE_ENV=production`, and `DB_PATH` is unset: `os.tmpdir()/shopflow.db` so the free ephemeral filesystem is writable. That file is wiped on restart.
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
- SQLite via `better-sqlite3` (`prepare` / `get` / `run` / `all` / `exec`, WAL mode)
- Static HTML + CSS + `fetch` (no heavy SPA framework)

## Deploy (free tiers, short)

Any Node host that can keep a writable disk (or mount a volume) works.

### Render

1. New **Web Service** from this folder  
2. Build: `npm install`  
3. Start: `npm start`  
4. On the free plan the database defaults to the writable temp directory (`RENDER` is set). Data does not survive restarts. Add a disk and set `DB_PATH` if you need persistence.  

### Railway / Fly.io

- Start command: `npm start`
- Set `PORT` is provided by the platform (app already reads `process.env.PORT`)
- Attach a volume and point `DB_PATH` at it so SQLite survives restarts

Example Dockerfile sketch:

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=3847
CMD ["npm", "start"]
```

`better-sqlite3` ships glibc prebuilds. Use a Debian-based image (as above) so `npm install` does not need a compiler.

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

Native apps, payments, multi-tenant auth, full MRP.

## License

MIT
