/* Shared ShopFlow helpers */
window.ShopFlow = {
  async api(path, options = {}) {
    const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
    if (opts.body && typeof opts.body === 'object') {
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
    return data;
  },

  toast(msg, type = 'ok') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3200);
  },

  badge(status) {
    const s = String(status || '');
    return `<span class="badge ${s}">${s.replace('_', ' ')}</span>`;
  },

  escape(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  markActiveNav() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (href !== '/' && path.endsWith(href.replace(/^\//, '')))) {
        a.classList.add('active');
      }
      if ((path === '/shop' || path.endsWith('/shop.html')) && href === '/shop') {
        a.classList.add('active');
      }
      if ((path === '/' || path.endsWith('/index.html')) && href === '/') {
        a.classList.add('active');
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', () => ShopFlow.markActiveNav());
