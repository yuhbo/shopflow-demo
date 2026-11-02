'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'shopflow.db');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function createSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      unit TEXT NOT NULL DEFAULT 'ea',
      on_hand REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS routings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      material_id INTEGER REFERENCES materials(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS routing_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routing_id INTEGER NOT NULL REFERENCES routings(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      work_center TEXT,
      std_minutes REAL DEFAULT 0,
      UNIQUE(routing_id, seq)
    );

    CREATE TABLE IF NOT EXISTS work_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wo_number TEXT NOT NULL UNIQUE,
      material_id INTEGER NOT NULL REFERENCES materials(id),
      routing_id INTEGER REFERENCES routings(id) ON DELETE SET NULL,
      qty_planned REAL NOT NULL DEFAULT 1,
      qty_completed REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft'
        CHECK(status IN ('draft','released','in_progress','done')),
      due_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS work_order_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      seq INTEGER NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      work_center TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','in_progress','done')),
      qty_good REAL NOT NULL DEFAULT 0,
      qty_scrap REAL NOT NULL DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      UNIQUE(work_order_id, seq)
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL REFERENCES materials(id),
      movement_type TEXT NOT NULL
        CHECK(movement_type IN ('issue','receipt','adjust')),
      qty REAL NOT NULL,
      work_order_id INTEGER REFERENCES work_orders(id) ON DELETE SET NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS shop_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      operation_id INTEGER NOT NULL REFERENCES work_order_operations(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL CHECK(event_type IN ('start','complete')),
      qty_good REAL DEFAULT 0,
      qty_scrap REAL DEFAULT 0,
      scan_code TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seed(db) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM materials').get().n;
  if (count > 0) return false;

  const insertMat = db.prepare(
    'INSERT INTO materials (sku, name, unit, on_hand) VALUES (?, ?, ?, ?)'
  );
  const mats = [
    ['RM-AL6061', 'Aluminum bar 6061 Ø25mm', 'kg', 120],
    ['RM-SS304', 'Stainless steel plate 304 3mm', 'kg', 80],
    ['FG-BRACKET', 'Mounting bracket Type-A', 'ea', 15],
    ['FG-SHAFT', 'Drive shaft Ø20×180', 'ea', 8],
    ['RM-FASTENER', 'M6 hex bolt kit', 'ea', 500],
  ];
  for (const m of mats) insertMat.run(...m);

  const insertRouting = db.prepare(
    'INSERT INTO routings (code, name, material_id, notes) VALUES (?, ?, ?, ?)'
  );
  const insertOp = db.prepare(
    'INSERT INTO routing_operations (routing_id, seq, code, name, work_center, std_minutes) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const bracket = db.prepare("SELECT id FROM materials WHERE sku='FG-BRACKET'").get();
  const shaft = db.prepare("SELECT id FROM materials WHERE sku='FG-SHAFT'").get();

  const r1 = insertRouting.run(
    'RT-BRACKET',
    'Bracket Type-A routing',
    bracket.id,
    'Saw → Mill → Deburr → Inspect'
  );
  insertOp.run(r1.lastInsertRowid, 10, 'OP10', 'Cut blank', 'SAW-01', 8);
  insertOp.run(r1.lastInsertRowid, 20, 'OP20', 'CNC mill pockets', 'CNC-02', 25);
  insertOp.run(r1.lastInsertRowid, 30, 'OP30', 'Deburr & clean', 'BENCH-01', 10);
  insertOp.run(r1.lastInsertRowid, 40, 'OP40', 'Final inspect', 'QC-01', 5);

  const r2 = insertRouting.run(
    'RT-SHAFT',
    'Drive shaft routing',
    shaft.id,
    'Turn → Keyway → Grind → Inspect'
  );
  insertOp.run(r2.lastInsertRowid, 10, 'OP10', 'Rough turn', 'LATHE-01', 20);
  insertOp.run(r2.lastInsertRowid, 20, 'OP20', 'Finish turn + face', 'LATHE-01', 18);
  insertOp.run(r2.lastInsertRowid, 30, 'OP30', 'Mill keyway', 'MILL-01', 12);
  insertOp.run(r2.lastInsertRowid, 40, 'OP40', 'Grind OD', 'GRIND-01', 15);
  insertOp.run(r2.lastInsertRowid, 50, 'OP50', 'Final inspect', 'QC-01', 5);

  // Helper: create WO + copy routing ops
  function createWO({ number, materialId, routingId, qty, status, due }) {
    const wo = db
      .prepare(
        `INSERT INTO work_orders
         (wo_number, material_id, routing_id, qty_planned, status, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(number, materialId, routingId, qty, status, due);

    const ops = db
      .prepare(
        'SELECT seq, code, name, work_center FROM routing_operations WHERE routing_id=? ORDER BY seq'
      )
      .all(routingId);

    const insWOOp = db.prepare(
      `INSERT INTO work_order_operations
       (work_order_id, seq, code, name, work_center, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const op of ops) {
      let opStatus = 'pending';
      if (status === 'in_progress' && op.seq === 10) opStatus = 'done';
      if (status === 'in_progress' && op.seq === 20) opStatus = 'in_progress';
      insWOOp.run(wo.lastInsertRowid, op.seq, op.code, op.name, op.work_center, opStatus);
    }

    if (status === 'in_progress') {
      db.prepare(
        'UPDATE work_order_operations SET qty_good=?, completed_at=datetime(\'now\') WHERE work_order_id=? AND seq=10'
      ).run(qty, wo.lastInsertRowid);
      db.prepare(
        'UPDATE work_order_operations SET started_at=datetime(\'now\') WHERE work_order_id=? AND seq=20'
      ).run(wo.lastInsertRowid);
    }

    return wo.lastInsertRowid;
  }

  createWO({
    number: 'WO-1001',
    materialId: bracket.id,
    routingId: r1.lastInsertRowid,
    qty: 50,
    status: 'released',
    due: '2026-11-10',
  });
  createWO({
    number: 'WO-1002',
    materialId: shaft.id,
    routingId: r2.lastInsertRowid,
    qty: 20,
    status: 'in_progress',
    due: '2026-11-08',
  });
  createWO({
    number: 'WO-1003',
    materialId: bracket.id,
    routingId: r1.lastInsertRowid,
    qty: 30,
    status: 'draft',
    due: '2026-11-15',
  });

  return true;
}

function openDatabase({ reseed = false } = {}) {
  ensureDataDir();
  if (reseed && fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    const wal = DB_PATH + '-wal';
    const shm = DB_PATH + '-shm';
    if (fs.existsSync(wal)) fs.unlinkSync(wal);
    if (fs.existsSync(shm)) fs.unlinkSync(shm);
  }
  const db = new DatabaseSync(DB_PATH);
  createSchema(db);
  const seeded = seed(db);
  return { db, path: DB_PATH, seeded };
}

if (require.main === module) {
  const reseed = process.argv.includes('--reseed');
  const { path: p, seeded } = openDatabase({ reseed });
  console.log(`Database ready at ${p} (seeded=${seeded || reseed})`);
}


function withTransaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    throw e;
  }
}

module.exports = { openDatabase, DB_PATH, DATA_DIR, withTransaction };
