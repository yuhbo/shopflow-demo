'use strict';

const { withTransaction } = require('./db');

function registerRoutes(app, db) {
  // ---------- Materials ----------
  app.get('/api/materials', (_req, res) => {
    const rows = db
      .prepare('SELECT * FROM materials ORDER BY sku')
      .all();
    res.json(rows);
  });

  app.post('/api/materials', (req, res) => {
    const { sku, name, unit = 'ea', on_hand = 0 } = req.body || {};
    if (!sku || !name) return res.status(400).json({ error: 'sku and name required' });
    try {
      const r = db
        .prepare('INSERT INTO materials (sku, name, unit, on_hand) VALUES (?, ?, ?, ?)')
        .run(String(sku).trim(), String(name).trim(), String(unit).trim() || 'ea', Number(on_hand) || 0);
      const row = db.prepare('SELECT * FROM materials WHERE id=?').get(r.lastInsertRowid);
      res.status(201).json(row);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch('/api/materials/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM materials WHERE id=?').get(id);
    if (!existing) return res.status(404).json({ error: 'not found' });
    const sku = req.body.sku ?? existing.sku;
    const name = req.body.name ?? existing.name;
    const unit = req.body.unit ?? existing.unit;
    const on_hand = req.body.on_hand !== undefined ? Number(req.body.on_hand) : existing.on_hand;
    try {
      db.prepare('UPDATE materials SET sku=?, name=?, unit=?, on_hand=? WHERE id=?').run(
        sku, name, unit, on_hand, id
      );
      res.json(db.prepare('SELECT * FROM materials WHERE id=?').get(id));
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Routings ----------
  app.get('/api/routings', (_req, res) => {
    const routings = db
      .prepare(
        `SELECT r.*, m.sku AS material_sku, m.name AS material_name
         FROM routings r
         LEFT JOIN materials m ON m.id = r.material_id
         ORDER BY r.code`
      )
      .all();
    const ops = db
      .prepare(
        'SELECT * FROM routing_operations ORDER BY routing_id, seq'
      )
      .all();
    const byRouting = {};
    for (const op of ops) {
      (byRouting[op.routing_id] ||= []).push(op);
    }
    res.json(routings.map((r) => ({ ...r, operations: byRouting[r.id] || [] })));
  });

  app.get('/api/routings/:id', (req, res) => {
    const r = db
      .prepare(
        `SELECT r.*, m.sku AS material_sku, m.name AS material_name
         FROM routings r LEFT JOIN materials m ON m.id=r.material_id WHERE r.id=?`
      )
      .get(Number(req.params.id));
    if (!r) return res.status(404).json({ error: 'not found' });
    const operations = db
      .prepare('SELECT * FROM routing_operations WHERE routing_id=? ORDER BY seq')
      .all(r.id);
    res.json({ ...r, operations });
  });

  app.post('/api/routings', (req, res) => {
    const { code, name, material_id, notes, operations = [] } = req.body || {};
    if (!code || !name) return res.status(400).json({ error: 'code and name required' });
    try {
      const __txResult = withTransaction(db, () => {
        const r = db
          .prepare('INSERT INTO routings (code, name, material_id, notes) VALUES (?, ?, ?, ?)')
          .run(String(code).trim(), String(name).trim(), material_id || null, notes || null);
        const rid = r.lastInsertRowid;
        const ins = db.prepare(
          `INSERT INTO routing_operations (routing_id, seq, code, name, work_center, std_minutes)
           VALUES (?, ?, ?, ?, ?, ?)`
        );
        for (const op of operations) {
          ins.run(
            rid,
            Number(op.seq),
            String(op.code).trim(),
            String(op.name).trim(),
            op.work_center || null,
            Number(op.std_minutes) || 0
          );
        }
        return rid;
      });
      const id = __txResult;
      const created = db.prepare('SELECT * FROM routings WHERE id=?').get(id);
      const ops = db.prepare('SELECT * FROM routing_operations WHERE routing_id=? ORDER BY seq').all(id);
      res.status(201).json({ ...created, operations: ops });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Work Orders ----------
  app.get('/api/work-orders', (_req, res) => {
    const rows = db
      .prepare(
        `SELECT wo.*, m.sku AS material_sku, m.name AS material_name, r.code AS routing_code
         FROM work_orders wo
         JOIN materials m ON m.id = wo.material_id
         LEFT JOIN routings r ON r.id = wo.routing_id
         ORDER BY wo.id DESC`
      )
      .all();
    res.json(rows);
  });

  app.get('/api/work-orders/:id', (req, res) => {
    const wo = db
      .prepare(
        `SELECT wo.*, m.sku AS material_sku, m.name AS material_name, r.code AS routing_code, r.name AS routing_name
         FROM work_orders wo
         JOIN materials m ON m.id = wo.material_id
         LEFT JOIN routings r ON r.id = wo.routing_id
         WHERE wo.id=?`
      )
      .get(Number(req.params.id));
    if (!wo) return res.status(404).json({ error: 'not found' });
    const operations = db
      .prepare('SELECT * FROM work_order_operations WHERE work_order_id=? ORDER BY seq')
      .all(wo.id);
    res.json({ ...wo, operations });
  });

  function copyRoutingToWO(workOrderId, routingId) {
    const ops = db
      .prepare('SELECT * FROM routing_operations WHERE routing_id=? ORDER BY seq')
      .all(routingId);
    const ins = db.prepare(
      `INSERT INTO work_order_operations (work_order_id, seq, code, name, work_center, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    );
    for (const op of ops) {
      ins.run(workOrderId, op.seq, op.code, op.name, op.work_center);
    }
  }

  app.post('/api/work-orders', (req, res) => {
    const { wo_number, material_id, routing_id, qty_planned = 1, due_date, notes, status = 'draft' } =
      req.body || {};
    if (!wo_number || !material_id) {
      return res.status(400).json({ error: 'wo_number and material_id required' });
    }
    const allowed = ['draft', 'released'];
    const st = allowed.includes(status) ? status : 'draft';
    try {
      const __txResult = withTransaction(db, () => {
        const r = db
          .prepare(
            `INSERT INTO work_orders
             (wo_number, material_id, routing_id, qty_planned, status, due_date, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            String(wo_number).trim(),
            Number(material_id),
            routing_id ? Number(routing_id) : null,
            Number(qty_planned) || 1,
            st,
            due_date || null,
            notes || null
          );
        if (routing_id) copyRoutingToWO(r.lastInsertRowid, Number(routing_id));
        return r.lastInsertRowid;
      });
      const id = __txResult;
      const wo = db.prepare('SELECT * FROM work_orders WHERE id=?').get(id);
      const operations = db
        .prepare('SELECT * FROM work_order_operations WHERE work_order_id=? ORDER BY seq')
        .all(id);
      res.status(201).json({ ...wo, operations });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/work-orders/:id/release', (req, res) => {
    const id = Number(req.params.id);
    const wo = db.prepare('SELECT * FROM work_orders WHERE id=?').get(id);
    if (!wo) return res.status(404).json({ error: 'not found' });
    if (wo.status !== 'draft') return res.status(400).json({ error: 'only draft can be released' });
    const ops = db.prepare('SELECT COUNT(*) AS n FROM work_order_operations WHERE work_order_id=?').get(id);
    if (!ops.n) return res.status(400).json({ error: 'work order has no operations — attach a routing first' });
    db.prepare(
      `UPDATE work_orders SET status='released', updated_at=datetime('now') WHERE id=?`
    ).run(id);
    res.json(db.prepare('SELECT * FROM work_orders WHERE id=?').get(id));
  });

  app.post('/api/work-orders/:id/apply-routing', (req, res) => {
    const id = Number(req.params.id);
    const routingId = Number(req.body?.routing_id);
    const wo = db.prepare('SELECT * FROM work_orders WHERE id=?').get(id);
    if (!wo) return res.status(404).json({ error: 'not found' });
    if (!['draft', 'released'].includes(wo.status)) {
      return res.status(400).json({ error: 'cannot change routing after work started' });
    }
    if (!routingId) return res.status(400).json({ error: 'routing_id required' });
    const routing = db.prepare('SELECT * FROM routings WHERE id=?').get(routingId);
    if (!routing) return res.status(404).json({ error: 'routing not found' });
    try {
      const __txResult = withTransaction(db, () => {
        db.prepare('DELETE FROM work_order_operations WHERE work_order_id=?').run(id);
        db.prepare(
          `UPDATE work_orders SET routing_id=?, updated_at=datetime('now') WHERE id=?`
        ).run(routingId, id);
        copyRoutingToWO(id, routingId);
      });
      /* transaction done */
      const operations = db
        .prepare('SELECT * FROM work_order_operations WHERE work_order_id=? ORDER BY seq')
        .all(id);
      res.json({ ...db.prepare('SELECT * FROM work_orders WHERE id=?').get(id), operations });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Shop Floor ----------
  app.get('/api/shop/board', (_req, res) => {
    const orders = db
      .prepare(
        `SELECT wo.*, m.sku AS material_sku, m.name AS material_name
         FROM work_orders wo
         JOIN materials m ON m.id = wo.material_id
         WHERE wo.status IN ('released','in_progress')
         ORDER BY wo.due_date IS NULL, wo.due_date, wo.id`
      )
      .all();
    const result = orders.map((wo) => {
      const operations = db
        .prepare('SELECT * FROM work_order_operations WHERE work_order_id=? ORDER BY seq')
        .all(wo.id);
      return { ...wo, operations };
    });
    res.json(result);
  });

  app.get('/api/shop/lookup', (req, res) => {
    const code = String(req.query.code || '').trim();
    if (!code) return res.status(400).json({ error: 'code required' });

    // Accept: WO-1001, WO-1001:OP20, OP20@WO-1001
    let woNumber = code;
    let opCode = null;
    if (code.includes(':')) {
      [woNumber, opCode] = code.split(':').map((s) => s.trim());
    } else if (code.includes('@')) {
      [opCode, woNumber] = code.split('@').map((s) => s.trim());
    }

    const wo = db
      .prepare(
        `SELECT wo.*, m.sku AS material_sku, m.name AS material_name
         FROM work_orders wo JOIN materials m ON m.id=wo.material_id
         WHERE wo.wo_number=?`
      )
      .get(woNumber);
    if (!wo) return res.status(404).json({ error: `work order not found for scan "${code}"` });

    const operations = db
      .prepare('SELECT * FROM work_order_operations WHERE work_order_id=? ORDER BY seq')
      .all(wo.id);

    let focus = null;
    if (opCode) {
      focus = operations.find((o) => o.code.toUpperCase() === opCode.toUpperCase()) || null;
    } else {
      focus =
        operations.find((o) => o.status === 'in_progress') ||
        operations.find((o) => o.status === 'pending') ||
        null;
    }
    res.json({ work_order: wo, operations, focus });
  });

  app.post('/api/shop/start', (req, res) => {
    const { operation_id, scan_code } = req.body || {};
    if (!operation_id) return res.status(400).json({ error: 'operation_id required' });
    try {
      const result = withTransaction(db, () => {
        const op = db.prepare('SELECT * FROM work_order_operations WHERE id=?').get(Number(operation_id));
        if (!op) throw new Error('operation not found');
        if (op.status === 'done') throw new Error('operation already complete');
        const wo = db.prepare('SELECT * FROM work_orders WHERE id=?').get(op.work_order_id);
        if (!['released', 'in_progress'].includes(wo.status)) {
          throw new Error('work order must be released first');
        }
        // Enforce sequence: previous ops must be done
        const prev = db
          .prepare(
            `SELECT * FROM work_order_operations
             WHERE work_order_id=? AND seq < ? AND status != 'done'`
          )
          .all(op.work_order_id, op.seq);
        if (prev.length) throw new Error(`complete prior operation ${prev[0].code} first`);

        db.prepare(
          `UPDATE work_order_operations
           SET status='in_progress', started_at=COALESCE(started_at, datetime('now'))
           WHERE id=?`
        ).run(op.id);
        if (wo.status === 'released') {
          db.prepare(
            `UPDATE work_orders SET status='in_progress', updated_at=datetime('now') WHERE id=?`
          ).run(wo.id);
        }
        db.prepare(
          `INSERT INTO shop_events (work_order_id, operation_id, event_type, scan_code)
           VALUES (?, ?, 'start', ?)`
        ).run(wo.id, op.id, scan_code || null);
        return {
          work_order: db.prepare('SELECT * FROM work_orders WHERE id=?').get(wo.id),
          operation: db.prepare('SELECT * FROM work_order_operations WHERE id=?').get(op.id),
        };
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/shop/complete', (req, res) => {
    const { operation_id, qty_good, qty_scrap = 0, scan_code, issue_material_id, issue_qty } =
      req.body || {};
    if (!operation_id) return res.status(400).json({ error: 'operation_id required' });
    try {
      const result = withTransaction(db, () => {
        const op = db.prepare('SELECT * FROM work_order_operations WHERE id=?').get(Number(operation_id));
        if (!op) throw new Error('operation not found');
        if (op.status === 'done') throw new Error('operation already complete');
        const wo = db.prepare('SELECT * FROM work_orders WHERE id=?').get(op.work_order_id);
        if (!['released', 'in_progress'].includes(wo.status)) {
          throw new Error('work order must be released first');
        }
        const good = Number(qty_good);
        if (!(good >= 0)) throw new Error('qty_good required');
        const scrap = Number(qty_scrap) || 0;

        db.prepare(
          `UPDATE work_order_operations
           SET status='done', qty_good=?, qty_scrap=?,
               started_at=COALESCE(started_at, datetime('now')),
               completed_at=datetime('now')
           WHERE id=?`
        ).run(good, scrap, op.id);

        if (wo.status === 'released') {
          db.prepare(
            `UPDATE work_orders SET status='in_progress', updated_at=datetime('now') WHERE id=?`
          ).run(wo.id);
        }

        db.prepare(
          `INSERT INTO shop_events
           (work_order_id, operation_id, event_type, qty_good, qty_scrap, scan_code)
           VALUES (?, ?, 'complete', ?, ?, ?)`
        ).run(wo.id, op.id, good, scrap, scan_code || null);

        // Optional material issue on first op complete
        if (issue_material_id && issue_qty) {
          const mid = Number(issue_material_id);
          const qty = Number(issue_qty);
          const mat = db.prepare('SELECT * FROM materials WHERE id=?').get(mid);
          if (!mat) throw new Error('issue material not found');
          if (mat.on_hand < qty) throw new Error(`insufficient on-hand for ${mat.sku}`);
          db.prepare('UPDATE materials SET on_hand = on_hand - ? WHERE id=?').run(qty, mid);
          db.prepare(
            `INSERT INTO inventory_movements
             (material_id, movement_type, qty, work_order_id, note)
             VALUES (?, 'issue', ?, ?, ?)`
          ).run(mid, -Math.abs(qty), wo.id, `Issue for ${wo.wo_number} / ${op.code}`);
        }

        // If all ops done → finish WO + FG receipt
        const pending = db
          .prepare(
            `SELECT COUNT(*) AS n FROM work_order_operations
             WHERE work_order_id=? AND status != 'done'`
          )
          .get(wo.id).n;

        let finished = false;
        if (pending === 0) {
          const lastGood = db
            .prepare(
              `SELECT qty_good FROM work_order_operations
               WHERE work_order_id=? ORDER BY seq DESC LIMIT 1`
            )
            .get(wo.id).qty_good;
          db.prepare(
            `UPDATE work_orders
             SET status='done', qty_completed=?, updated_at=datetime('now')
             WHERE id=?`
          ).run(lastGood, wo.id);
          db.prepare('UPDATE materials SET on_hand = on_hand + ? WHERE id=?').run(
            lastGood,
            wo.material_id
          );
          db.prepare(
            `INSERT INTO inventory_movements
             (material_id, movement_type, qty, work_order_id, note)
             VALUES (?, 'receipt', ?, ?, ?)`
          ).run(wo.material_id, lastGood, wo.id, `FG receipt ${wo.wo_number}`);
          finished = true;
        }

        return {
          work_order: db.prepare('SELECT * FROM work_orders WHERE id=?').get(wo.id),
          operation: db.prepare('SELECT * FROM work_order_operations WHERE id=?').get(op.id),
          finished,
        };
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Inventory ----------
  app.get('/api/inventory/movements', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const rows = db
      .prepare(
        `SELECT mv.*, m.sku, m.name AS material_name, wo.wo_number
         FROM inventory_movements mv
         JOIN materials m ON m.id = mv.material_id
         LEFT JOIN work_orders wo ON wo.id = mv.work_order_id
         ORDER BY mv.id DESC
         LIMIT ?`
      )
      .all(limit);
    res.json(rows);
  });

  app.post('/api/inventory/adjust', (req, res) => {
    const { material_id, qty, note } = req.body || {};
    if (!material_id || qty === undefined) {
      return res.status(400).json({ error: 'material_id and qty required' });
    }
    try {
      const result = withTransaction(db, () => {
        const mat = db.prepare('SELECT * FROM materials WHERE id=?').get(Number(material_id));
        if (!mat) throw new Error('material not found');
        const delta = Number(qty);
        const next = mat.on_hand + delta;
        if (next < 0) throw new Error('adjustment would make on-hand negative');
        db.prepare('UPDATE materials SET on_hand=? WHERE id=?').run(next, mat.id);
        db.prepare(
          `INSERT INTO inventory_movements (material_id, movement_type, qty, note)
           VALUES (?, 'adjust', ?, ?)`
        ).run(mat.id, delta, note || 'Manual adjustment');
        return db.prepare('SELECT * FROM materials WHERE id=?').get(mat.id);
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/inventory/issue', (req, res) => {
    const { material_id, qty, work_order_id, note } = req.body || {};
    if (!material_id || !(Number(qty) > 0)) {
      return res.status(400).json({ error: 'material_id and positive qty required' });
    }
    try {
      const result = withTransaction(db, () => {
        const mat = db.prepare('SELECT * FROM materials WHERE id=?').get(Number(material_id));
        if (!mat) throw new Error('material not found');
        const q = Number(qty);
        if (mat.on_hand < q) throw new Error(`insufficient on-hand (${mat.on_hand})`);
        db.prepare('UPDATE materials SET on_hand = on_hand - ? WHERE id=?').run(q, mat.id);
        db.prepare(
          `INSERT INTO inventory_movements
           (material_id, movement_type, qty, work_order_id, note)
           VALUES (?, 'issue', ?, ?, ?)`
        ).run(mat.id, -q, work_order_id || null, note || 'Material issue');
        return db.prepare('SELECT * FROM materials WHERE id=?').get(mat.id);
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/inventory/receipt', (req, res) => {
    const { material_id, qty, work_order_id, note } = req.body || {};
    if (!material_id || !(Number(qty) > 0)) {
      return res.status(400).json({ error: 'material_id and positive qty required' });
    }
    try {
      const result = withTransaction(db, () => {
        const mat = db.prepare('SELECT * FROM materials WHERE id=?').get(Number(material_id));
        if (!mat) throw new Error('material not found');
        const q = Number(qty);
        db.prepare('UPDATE materials SET on_hand = on_hand + ? WHERE id=?').run(q, mat.id);
        db.prepare(
          `INSERT INTO inventory_movements
           (material_id, movement_type, qty, work_order_id, note)
           VALUES (?, 'receipt', ?, ?, ?)`
        ).run(mat.id, q, work_order_id || null, note || 'Inventory receipt');
        return db.prepare('SELECT * FROM materials WHERE id=?').get(mat.id);
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- Dashboard ----------
  app.get('/api/dashboard', (_req, res) => {
    const byStatus = db
      .prepare(
        `SELECT status, COUNT(*) AS count FROM work_orders GROUP BY status`
      )
      .all();
    const openOrders = db
      .prepare(
        `SELECT wo.*, m.sku AS material_sku, m.name AS material_name,
           (SELECT COUNT(*) FROM work_order_operations o WHERE o.work_order_id=wo.id) AS op_total,
           (SELECT COUNT(*) FROM work_order_operations o WHERE o.work_order_id=wo.id AND o.status='done') AS op_done
         FROM work_orders wo
         JOIN materials m ON m.id = wo.material_id
         WHERE wo.status != 'done'
         ORDER BY wo.due_date IS NULL, wo.due_date, wo.id`
      )
      .all();
    const lowStock = db
      .prepare('SELECT * FROM materials WHERE on_hand < 20 ORDER BY on_hand ASC LIMIT 10')
      .all();
    const recentMoves = db
      .prepare(
        `SELECT mv.*, m.sku FROM inventory_movements mv
         JOIN materials m ON m.id=mv.material_id
         ORDER BY mv.id DESC LIMIT 8`
      )
      .all();
    res.json({ byStatus, openOrders, lowStock, recentMoves });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: 'sqlite', time: new Date().toISOString() });
  });
}

module.exports = { registerRoutes };
