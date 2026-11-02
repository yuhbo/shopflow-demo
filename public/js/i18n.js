/* Client-side zh/en dictionary. Default is Chinese. Choice is stored in localStorage. */
(function () {
  const KEY = 'shopflow_lang';

  const DICT = {
    zh: {
      'lang.aria': '语言',
      'header.meta': '演示工厂 · 单站点',
      'nav.dashboard': '总览',
      'nav.materials': '物料',
      'nav.routings': '工艺路线',
      'nav.workOrders': '工单',
      'nav.shop': '车间',
      'nav.inventory': '库存',

      'title.dashboard': '总览 — ShopFlow',
      'title.materials': '物料 — ShopFlow',
      'title.routings': '工艺路线 — ShopFlow',
      'title.workOrders': '工单 — ShopFlow',
      'title.shop': '车间 — ShopFlow',
      'title.inventory': '库存 — ShopFlow',

      'dash.title': '总览',
      'dash.subtitle': '演示工厂的工单进度和库存概况。',
      'dash.hint': '建议路径：打开<strong>工单</strong> → 下达一张草稿 → 进入<strong>车间</strong> → 开工 / 完工 → 工单完成后到<strong>库存</strong>查看现存量变化。',
      'dash.openOrders': '未结工单',
      'dash.col.wo': '工单',
      'dash.col.part': '物料',
      'dash.col.status': '状态',
      'dash.col.progress': '进度',
      'dash.col.due': '交期',
      'dash.lowStock': '低库存（< 20）',
      'dash.col.sku': '编码',
      'dash.col.name': '名称',
      'dash.col.onHand': '现存量',
      'dash.moves': '最近出入库',
      'dash.col.when': '时间',
      'dash.col.type': '类型',
      'dash.col.qty': '数量',
      'dash.emptyOrders': '没有未结工单',
      'dash.emptyNone': '无',
      'dash.emptyMoves': '还没有出入库记录',
      'dash.progress': '{done}/{total} 道工序 · {pct}%',

      'pricing.kicker': '国际版示意价',
      'pricing.title': '示意价格',
      'pricing.range': '约 ¥220–¥400/厂/月',
      'pricing.rangeNote': '大约 $30–$55/厂/月，按约 7.2 汇率估算。同一套轻量演示（工单、车间、库存），不是报价，此页不能付款。',
      'pricing.starter.name': '入门版',
      'pricing.starter.amount': '约 ¥252',
      'pricing.starter.unit': '/厂/月',
      'pricing.starter.basis': '约 $35 × 7.2',
      'pricing.starter.blurb': '单工厂的工单、工艺路线和库存。',
      'pricing.starter.f1': '物料、工艺路线、工单',
      'pricing.starter.f2': '库存收发与调整',
      'pricing.starter.f3': '一个工厂',
      'pricing.growth.name': '成长版',
      'pricing.growth.amount': '约 ¥396',
      'pricing.growth.unit': '/厂/月',
      'pricing.growth.basis': '约 $55 × 7.2',
      'pricing.growth.blurb': '入门版再加上车间报工。',
      'pricing.growth.f1': '包含入门版',
      'pricing.growth.f2': '车间扫码、开工、完工',
      'pricing.growth.f3': '总览上的低库存',
      'pricing.growth.f4': '演示答疑（非正式服务）',
      'pricing.fx': '区间取大约 $30–$55：× 约 7.2 为 ¥216–¥396，写作 约 ¥220–¥400/厂/月。入门约 $35（≈¥252），成长约 $55（≈¥396）。国际版自助演示示意价，功能都可点，不能在此结账。',

      'status.draft': '草稿',
      'status.released': '已下达',
      'status.in_progress': '进行中',
      'status.done': '已完成',
      'status.pending': '待开始',

      'moveType.issue': '发料',
      'moveType.receipt': '入库',
      'moveType.adjust': '调整',

      'common.cancel': '取消',
      'common.save': '保存',
      'common.close': '关闭',
      'common.minutes': '{n} 分钟',

      'mat.title': '物料',
      'mat.subtitle': '主数据：编码、名称、单位和现存量。',
      'mat.new': '+ 新建物料',
      'mat.col.sku': '编码',
      'mat.col.name': '名称',
      'mat.col.unit': '单位',
      'mat.col.onHand': '现存量',
      'mat.modalTitle': '新建物料',
      'mat.sku': '编码',
      'mat.unit': '单位',
      'mat.name': '名称',
      'mat.onHand': '现存量',
      'mat.ph.sku': 'FG-WIDGET',
      'mat.ph.name': '支架总成',
      'mat.defaultUnit': '件',
      'mat.toast.created': '物料已创建',

      'rt.title': '工艺路线',
      'rt.subtitle': '可套用到工单上的有序工序列表。',
      'rt.new': '+ 新建工艺路线',
      'rt.modalTitle': '新建工艺路线',
      'rt.code': '编码',
      'rt.fg': '成品物料',
      'rt.name': '名称',
      'rt.notes': '备注',
      'rt.opsHelp': '工序（序号 / 编码 / 名称 / 工作中心），每行一道，用竖线分隔',
      'rt.ph.code': 'RT-WIDGET',
      'rt.ph.ops': '10 | OP10 | 下料 | SAW-01\n20 | OP20 | 数控铣 | CNC-02',
      'rt.optional': '— 可选 —',
      'rt.noFg': '未关联成品',
      'rt.empty': '没有工艺路线',
      'rt.toast.created': '工艺路线已创建',

      'wo.title': '工单',
      'wo.subtitle': '创建工单、套用工艺路线，并下达到车间。',
      'wo.new': '+ 新建工单',
      'wo.refresh': '刷新',
      'wo.modalTitle': '新建工单',
      'wo.number': '工单号',
      'wo.qtyPlanned': '计划数量',
      'wo.fg': '成品物料',
      'wo.routing': '工艺路线',
      'wo.due': '交期',
      'wo.notes': '备注',
      'wo.ph.number': 'WO-1100',
      'wo.noneRouting': '— 无 —',
      'wo.createDraft': '创建为草稿',
      'wo.view': '查看 / 工序',
      'wo.release': '下达',
      'wo.qtyBit': '数量 {qty}',
      'wo.noRouting': '无工艺路线',
      'wo.dueBit': '交期 {date}',
      'wo.empty': '没有工单',
      'wo.plannedBit': '计划 {qty}',
      'wo.completedBit': '完工 {qty}',
      'wo.noRoutingName': '无工艺路线',
      'wo.goodScrap': '合格 {good} / 报废 {scrap}',
      'wo.noOps': '没有工序 — 请先套用工艺路线',
      'wo.scanHint': '车间扫码：',
      'wo.toast.released': '工单已下达',
      'wo.toast.created': '工单已创建',

      'shop.title': '车间',
      'shop.subtitle': '扫码或点选工序，然后开工 / 完工。条码字符串用来模拟手持扫描枪。',
      'shop.scanTitle': '扫码',
      'shop.trySeed': '可试演示码：',
      'shop.barcode': '条码 / 二维码',
      'shop.ph.scan': 'WO-1001 或 WO-1001:OP20',
      'shop.lookup': '查询',
      'shop.boardTitle': '已下达与进行中',
      'shop.refresh': '刷新看板',
      'shop.empty': '没有已下达或进行中的工单。请先在工单页下达一张草稿。',
      'shop.planBit': '计划 {qty}',
      'shop.start': '开工',
      'shop.complete': '完工',
      'shop.goodBit': '合格 {qty}',
      'shop.loadScan': '填入扫码框',
      'shop.modalTitle': '完工工序',
      'shop.qtyGood': '合格数量',
      'shop.qtyScrap': '报废数量',
      'shop.issueMat': '发料（可选）',
      'shop.skip': '— 跳过 —',
      'shop.issueQty': '发料数量',
      'shop.toast.started': '工序已开工',
      'shop.toast.finished': '工单已完工 — 成品已入库',
      'shop.toast.completed': '工序已完工',

      'inv.title': '库存',
      'inv.subtitle': '现存量，以及发料 / 入库 / 调整记录。',
      'inv.quick': '快速过账',
      'inv.material': '物料',
      'inv.type': '类型',
      'inv.issue': '发料（出库）',
      'inv.receipt': '入库（收入）',
      'inv.adjust': '调整（±）',
      'inv.qty': '数量',
      'inv.note': '备注',
      'inv.ph.note': '可选',
      'inv.post': '过账',
      'inv.onHand': '现存量',
      'inv.col.sku': '编码',
      'inv.col.name': '名称',
      'inv.col.unit': '单位',
      'inv.col.qty': '数量',
      'inv.history': '出入库记录',
      'inv.col.when': '时间',
      'inv.col.type': '类型',
      'inv.col.wo': '工单',
      'inv.col.note': '备注',
      'inv.empty': '还没有出入库 — 请完工一张工单，或在上方过账',
      'inv.toast.posted': '已过账',
    },
    en: {
      'lang.aria': 'Language',
      'header.meta': 'Demo plant · single site',
      'nav.dashboard': 'Dashboard',
      'nav.materials': 'Materials',
      'nav.routings': 'Routings',
      'nav.workOrders': 'Work Orders',
      'nav.shop': 'Shop Floor',
      'nav.inventory': 'Inventory',

      'title.dashboard': 'ShopFlow — Dashboard',
      'title.materials': 'Materials — ShopFlow',
      'title.routings': 'Routings — ShopFlow',
      'title.workOrders': 'Work Orders — ShopFlow',
      'title.shop': 'Shop Floor — ShopFlow',
      'title.inventory': 'Inventory — ShopFlow',

      'dash.title': 'Dashboard',
      'dash.subtitle': 'Work order progress and inventory pulse for the demo plant.',
      'dash.hint': 'Suggested click path: open <strong>Work Orders</strong> → Release a draft → go to <strong>Shop Floor</strong> → Start/Complete operations → watch <strong>Inventory</strong> on-hand change when the WO finishes.',
      'dash.openOrders': 'Open work orders',
      'dash.col.wo': 'WO',
      'dash.col.part': 'Part',
      'dash.col.status': 'Status',
      'dash.col.progress': 'Progress',
      'dash.col.due': 'Due',
      'dash.lowStock': 'Low stock (< 20)',
      'dash.col.sku': 'SKU',
      'dash.col.name': 'Name',
      'dash.col.onHand': 'On hand',
      'dash.moves': 'Recent movements',
      'dash.col.when': 'When',
      'dash.col.type': 'Type',
      'dash.col.qty': 'Qty',
      'dash.emptyOrders': 'No open work orders',
      'dash.emptyNone': 'None',
      'dash.emptyMoves': 'No movements yet',
      'dash.progress': '{done}/{total} ops · {pct}%',

      'pricing.kicker': 'International self-serve demo',
      'pricing.title': 'Demo pricing',
      'pricing.range': '$30–$55/plant/mo',
      'pricing.rangeNote': 'About ¥220–¥400 per plant each month at roughly 7.2 CNY per USD. Same light demo (work orders, shop floor, inventory). Not a quote and not a checkout.',
      'pricing.starter.name': 'Starter',
      'pricing.starter.amount': '~$35',
      'pricing.starter.unit': '/plant/mo',
      'pricing.starter.basis': 'About $35 × 7.2 ≈ ¥252',
      'pricing.starter.blurb': 'Work orders, routings, and inventory for one plant.',
      'pricing.starter.f1': 'Materials, routings, and work orders',
      'pricing.starter.f2': 'Inventory issue, receipt, and adjust',
      'pricing.starter.f3': 'One plant',
      'pricing.growth.name': 'Growth',
      'pricing.growth.amount': '~$55',
      'pricing.growth.unit': '/plant/mo',
      'pricing.growth.basis': 'About $55 × 7.2 ≈ ¥396',
      'pricing.growth.blurb': 'Starter plus shop-floor reporting.',
      'pricing.growth.f1': 'Everything in Starter',
      'pricing.growth.f2': 'Scan, start, and complete on the shop floor',
      'pricing.growth.f3': 'Low-stock view on the dashboard',
      'pricing.growth.f4': 'Demo Q&A (not a support plan)',
      'pricing.fx': 'About $30–$55 per plant each month. At roughly 7.2 that is ¥216–¥396, shown as about ¥220–¥400/plant/mo. Starter is about $35 (≈ ¥252); Growth is about $55 (≈ ¥396). Illustrative international self-serve pricing only — every feature in the demo stays clickable, and there is no checkout.',

      'status.draft': 'draft',
      'status.released': 'released',
      'status.in_progress': 'in progress',
      'status.done': 'done',
      'status.pending': 'pending',

      'moveType.issue': 'issue',
      'moveType.receipt': 'receipt',
      'moveType.adjust': 'adjust',

      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.close': 'Close',
      'common.minutes': '{n} min',

      'mat.title': 'Materials',
      'mat.subtitle': 'Master data — SKU, name, unit, and on-hand quantity.',
      'mat.new': '+ New material',
      'mat.col.sku': 'SKU',
      'mat.col.name': 'Name',
      'mat.col.unit': 'Unit',
      'mat.col.onHand': 'On hand',
      'mat.modalTitle': 'New material',
      'mat.sku': 'SKU',
      'mat.unit': 'Unit',
      'mat.name': 'Name',
      'mat.onHand': 'On hand',
      'mat.ph.sku': 'FG-WIDGET',
      'mat.ph.name': 'Widget assembly',
      'mat.defaultUnit': 'ea',
      'mat.toast.created': 'Material created',

      'rt.title': 'Routings',
      'rt.subtitle': 'Ordered operation lists that can be applied to work orders.',
      'rt.new': '+ New routing',
      'rt.modalTitle': 'New routing',
      'rt.code': 'Code',
      'rt.fg': 'Finished material',
      'rt.name': 'Name',
      'rt.notes': 'Notes',
      'rt.opsHelp': 'Operations (seq / code / name / work center) — one per line, pipe-separated',
      'rt.ph.code': 'RT-WIDGET',
      'rt.ph.ops': '10 | OP10 | Cut blank | SAW-01\n20 | OP20 | CNC mill | CNC-02',
      'rt.optional': '— optional —',
      'rt.noFg': 'no FG link',
      'rt.empty': 'No routings',
      'rt.toast.created': 'Routing created',

      'wo.title': 'Work Orders',
      'wo.subtitle': 'Create orders, apply a routing, release to the shop floor.',
      'wo.new': '+ New work order',
      'wo.refresh': 'Refresh',
      'wo.modalTitle': 'New work order',
      'wo.number': 'WO number',
      'wo.qtyPlanned': 'Qty planned',
      'wo.fg': 'Finished material',
      'wo.routing': 'Routing',
      'wo.due': 'Due date',
      'wo.notes': 'Notes',
      'wo.ph.number': 'WO-1100',
      'wo.noneRouting': '— none —',
      'wo.createDraft': 'Create as draft',
      'wo.view': 'View / ops',
      'wo.release': 'Release',
      'wo.qtyBit': 'qty {qty}',
      'wo.noRouting': 'no routing',
      'wo.dueBit': 'due {date}',
      'wo.empty': 'No work orders',
      'wo.plannedBit': 'Planned {qty}',
      'wo.completedBit': 'Completed {qty}',
      'wo.noRoutingName': 'No routing',
      'wo.goodScrap': 'good {good} / scrap {scrap}',
      'wo.noOps': 'No operations — apply a routing',
      'wo.scanHint': 'Scan codes for shop floor:',
      'wo.toast.released': 'Work order released',
      'wo.toast.created': 'Work order created',

      'shop.title': 'Shop Floor',
      'shop.subtitle': 'Scan or select an operation, then Start / Complete. Barcode strings simulate a handheld scanner.',
      'shop.scanTitle': 'Scan',
      'shop.trySeed': 'Try seed codes:',
      'shop.barcode': 'Barcode / QR string',
      'shop.ph.scan': 'WO-1001 or WO-1001:OP20',
      'shop.lookup': 'Lookup',
      'shop.boardTitle': 'Released & in progress',
      'shop.refresh': 'Refresh board',
      'shop.empty': 'No released / in-progress work orders. Release a draft on the Work Orders page.',
      'shop.planBit': 'plan {qty}',
      'shop.start': 'Start',
      'shop.complete': 'Complete',
      'shop.goodBit': 'good {qty}',
      'shop.loadScan': 'Load in scan',
      'shop.modalTitle': 'Complete operation',
      'shop.qtyGood': 'Qty good',
      'shop.qtyScrap': 'Qty scrap',
      'shop.issueMat': 'Issue material (optional)',
      'shop.skip': '— skip —',
      'shop.issueQty': 'Issue qty',
      'shop.toast.started': 'Operation started',
      'shop.toast.finished': 'WO finished — FG received to inventory',
      'shop.toast.completed': 'Operation completed',

      'inv.title': 'Inventory',
      'inv.subtitle': 'On-hand balances and issue / receipt / adjust movements.',
      'inv.quick': 'Quick movement',
      'inv.material': 'Material',
      'inv.type': 'Type',
      'inv.issue': 'Issue (out)',
      'inv.receipt': 'Receipt (in)',
      'inv.adjust': 'Adjust (+/−)',
      'inv.qty': 'Qty',
      'inv.note': 'Note',
      'inv.ph.note': 'Optional',
      'inv.post': 'Post movement',
      'inv.onHand': 'On hand',
      'inv.col.sku': 'SKU',
      'inv.col.name': 'Name',
      'inv.col.unit': 'Unit',
      'inv.col.qty': 'Qty',
      'inv.history': 'Movement history',
      'inv.col.when': 'When',
      'inv.col.type': 'Type',
      'inv.col.wo': 'WO',
      'inv.col.note': 'Note',
      'inv.empty': 'No movements yet — complete a WO or post one above',
      'inv.toast.posted': 'Movement posted',
    },
  };

  const SEED_MATERIALS = {
    'RM-AL6061': { zh: '铝合金棒 6061 Ø25mm', en: 'Aluminum bar 6061 Ø25mm' },
    'RM-SS304': { zh: '304 不锈钢板 3mm', en: 'Stainless steel plate 304 3mm' },
    'FG-BRACKET': { zh: 'A 型安装支架', en: 'Mounting bracket Type-A' },
    'FG-SHAFT': { zh: '传动轴 Ø20×180', en: 'Drive shaft Ø20×180' },
    'RM-FASTENER': { zh: 'M6 内六角螺栓套件', en: 'M6 hex bolt kit' },
  };

  const SEED_ROUTINGS = {
    'RT-BRACKET': { zh: '支架 Type-A 工艺路线', en: 'Bracket Type-A routing' },
    'RT-SHAFT': { zh: '传动轴工艺路线', en: 'Drive shaft routing' },
  };

  const SEED_OPS = {
    'Cut blank': { zh: '下料', en: 'Cut blank' },
    'CNC mill pockets': { zh: '数控铣口袋', en: 'CNC mill pockets' },
    'Deburr & clean': { zh: '去毛刺与清洁', en: 'Deburr & clean' },
    'Final inspect': { zh: '终检', en: 'Final inspect' },
    'Rough turn': { zh: '粗车', en: 'Rough turn' },
    'Finish turn + face': { zh: '精车并端面', en: 'Finish turn + face' },
    'Mill keyway': { zh: '铣键槽', en: 'Mill keyway' },
    'Grind OD': { zh: '磨外圆', en: 'Grind OD' },
  };

  const SEED_WC = {
    'SAW-01': '锯床',
    'CNC-02': '数控铣',
    'BENCH-01': '钳工台',
    'QC-01': '质检',
    'LATHE-01': '车床',
    'MILL-01': '铣床',
    'GRIND-01': '磨床',
  };

  const UNITS = { ea: '件', kg: '千克', pcs: '件' };

  const ERRORS_ZH = {
    'sku and name required': '请填写编码和名称',
    'not found': '未找到',
    'code and name required': '请填写编码和名称',
    'wo_number and material_id required': '请填写工单号和物料',
    'only draft can be released': '只有草稿可以下达',
    'work order has no operations — attach a routing first': '工单没有工序 — 请先套用工艺路线',
    'cannot change routing after work started': '工单已开始，不能再改工艺路线',
    'routing_id required': '请选择工艺路线',
    'routing not found': '未找到工艺路线',
    'code required': '请填写条码',
    'operation_id required': '缺少工序',
    'operation not found': '未找到工序',
    'operation already complete': '工序已完工',
    'work order must be released first': '请先下达工单',
    'qty_good required': '请填写合格数量',
    'issue material not found': '未找到发料物料',
    'material_id and qty required': '请填写物料和数量',
    'material not found': '未找到物料',
    'adjustment would make on-hand negative': '调整后现存量不能为负',
    'material_id and positive qty required': '请填写物料和大于 0 的数量',
    'Request failed': '请求失败',
    'Failed to fetch': '网络请求失败',
  };

  function readStored() {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === 'zh' || stored === 'en') return stored;
    } catch (_) { /* private mode */ }
    return 'zh';
  }

  let current = readStored();
  const listeners = [];

  function t(key, vars) {
    const table = DICT[current] || DICT.zh;
    let str = table[key];
    if (str == null) str = (DICT.zh[key] != null ? DICT.zh[key] : key);
    if (vars) {
      str = String(str).replace(/\{(\w+)\}/g, (_, name) => (vars[name] == null ? '' : String(vars[name])));
    }
    return str;
  }

  function lookup(table, id, fallback) {
    const hit = id && table[id];
    if (!hit) return fallback;
    return hit[current] || fallback;
  }

  function materialName(sku, name) {
    return lookup(SEED_MATERIALS, sku, name);
  }

  function routingName(code, name) {
    return lookup(SEED_ROUTINGS, code, name);
  }

  function opName(name) {
    return lookup(SEED_OPS, name, name);
  }

  function workCenter(code) {
    if (!code) return '';
    if (current === 'zh' && SEED_WC[code]) return `${code} · ${SEED_WC[code]}`;
    return code;
  }

  function unit(code) {
    if (current === 'zh' && UNITS[code]) return UNITS[code];
    return code;
  }

  function statusLabel(status) {
    const key = `status.${status}`;
    const table = DICT[current] || DICT.zh;
    if (table[key]) return table[key];
    return String(status || '').replace(/_/g, ' ');
  }

  function moveType(type) {
    const key = `moveType.${type}`;
    const table = DICT[current] || DICT.zh;
    return table[key] || type;
  }

  function translateError(msg) {
    const text = String(msg || '');
    if (current !== 'zh') return text;
    if (ERRORS_ZH[text]) return ERRORS_ZH[text];
    let m = /^work order not found for scan "(.*)"$/.exec(text);
    if (m) return `未找到扫码「${m[1]}」对应的工单`;
    m = /^complete prior operation (.+) first$/.exec(text);
    if (m) return `请先完成前一道工序 ${m[1]}`;
    m = /^insufficient on-hand for (.+)$/.exec(text);
    if (m) return `${m[1]} 库存不足`;
    m = /^insufficient on-hand \((.+)\)$/.exec(text);
    if (m) return `库存不足（现有 ${m[1]}）`;
    if (/UNIQUE constraint failed: materials\.sku/i.test(text)) return '物料编码已存在';
    if (/UNIQUE constraint failed: routings\.code/i.test(text)) return '工艺路线编码已存在';
    if (/UNIQUE constraint failed: work_orders\.wo_number/i.test(text)) return '工单号已存在';
    return text;
  }

  function applyStatic(root) {
    const scope = root || document;
    document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.lang = current;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    scope.querySelectorAll('[data-i18n-value]').forEach((el) => {
      if (el.dataset.dirty === '1') return;
      el.value = t(el.getAttribute('data-i18n-value'));
    });
    scope.querySelectorAll('.lang-toggle [data-set-lang]').forEach((btn) => {
      const on = btn.getAttribute('data-set-lang') === current;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.documentElement.classList.add('i18n-ready');
  }

  function emit() {
    listeners.forEach((fn) => {
      try {
        const ret = fn(current);
        if (ret && typeof ret.then === 'function') {
          ret.catch((err) => console.error(err));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  function setLang(next) {
    if (next !== 'zh' && next !== 'en') return;
    if (next === current) return;
    current = next;
    try { localStorage.setItem(KEY, next); } catch (_) { /* ignore */ }
    applyStatic();
    emit();
  }

  function onLang(fn) {
    listeners.push(fn);
  }

  window.ShopFlow = Object.assign(window.ShopFlow || {}, {
    t,
    setLang,
    onLang,
    lang: () => current,
    materialName,
    routingName,
    opName,
    workCenter,
    unit,
    statusLabel,
    moveType,
    translateError,
    applyI18n: applyStatic,
  });

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-set-lang]');
    if (!btn) return;
    setLang(btn.getAttribute('data-set-lang'));
  });

  document.addEventListener('input', (event) => {
    const el = event.target;
    if (el && el.matches && el.matches('[data-i18n-value]')) el.dataset.dirty = '1';
  });

  try {
    document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
    document.documentElement.dataset.lang = current;
  } catch (_) { /* document not ready */ }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyStatic());
  } else {
    applyStatic();
  }
})();
