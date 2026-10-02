(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────

  var CATEGORIES_DEFAULT = ['Food', 'Transport', 'Fun'];

  var CHART_COLORS = [
    '#4e79a7','#f28e2b','#e15759','#76b7b2',
    '#59a14f','#edc948','#b07aa1','#ff9da7',
    '#9c755f','#bab0ac','#aaaaaa'
  ];

  var KEYS = { TX: 'ebv_tx', CAT: 'ebv_cat', LIM: 'ebv_lim' };

  // ── State ──────────────────────────────────────────────────────────────────

  var state = {
    transactions: [],
    categories:   [],   // [{name, predefined}]
    limits:       [],   // [{category, limit}]
    sortOrder:    'amount-desc',
    chart:        null
  };

  // ── Storage ────────────────────────────────────────────────────────────────

  function storageOk() {
    try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); return true; }
    catch(e) { return false; }
  }

  var _storageAvailable = null;

  function load(key, fallback) {
    if (_storageAvailable === null) _storageAvailable = storageOk();
    if (!_storageAvailable) return fallback;
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  }

  function save(key, value) {
    if (_storageAvailable === null) _storageAvailable = storageOk();
    if (!_storageAvailable) return;
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch(e) { toast('Could not save — storage may be full.'); }
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  function boot() {
    state.transactions = load(KEYS.TX, []);
    state.limits       = load(KEYS.LIM, []);

    var stored = load(KEYS.CAT, null);
    if (stored && stored.length) {
      state.categories = stored;
      // make sure every default still exists
      CATEGORIES_DEFAULT.forEach(function(n) {
        if (!state.categories.some(function(c){ return c.name === n; })) {
          state.categories.unshift({ name: n, predefined: true });
        }
      });
    } else {
      state.categories = CATEGORIES_DEFAULT.map(function(n) {
        return { name: n, predefined: true };
      });
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function fmt(n) {
    var a = Math.abs(n);
    try { return 'Rp ' + a.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
    catch(e) { return '$' + a.toFixed(2); }
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(function(){ el.classList.remove('visible'); }, 3000);
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(function(el){ el.textContent=''; });
  }

  function err(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  // ── Render: balance ────────────────────────────────────────────────────────

  function renderBalance() {
    var inc = 0, exp = 0;
    state.transactions.forEach(function(t) {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    var bal = exp;

    var balEl = document.getElementById('balance-amount');
    balEl.textContent = (bal < 0 ? '-' : '') + fmt(bal);
    balEl.style.color = bal < 0 ? 'var(--color-expense)' : 'var(--color-text)';

    var incEl = document.getElementById('income-total');
    var expEl = document.getElementById('expense-total');
    if (incEl) incEl.textContent = fmt(inc);
    if (expEl) expEl.textContent = fmt(exp);
  }

  // ── Render: category selects ───────────────────────────────────────────────

  function renderCategorySelects() {
    ['tx-category', 'limit-category-select'].forEach(function(id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      var prev = sel.value;
      sel.innerHTML = id === 'tx-category'
        ? '<option value="">-- Select a category --</option>' : '';
      state.categories.forEach(function(c) {
        var o = document.createElement('option');
        o.value = c.name; o.textContent = c.name;
        sel.appendChild(o);
      });
      if (prev) sel.value = prev;
    });
  }

  // ── Render: transaction list ───────────────────────────────────────────────

  function monthlyTotals() {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    var t = {};
    state.transactions.forEach(function(tx) {
      if (tx.type !== 'expense') return;
      var d = new Date(tx.date + 'T00:00:00');
      if (d.getFullYear() === y && d.getMonth() === m)
        t[tx.category] = (t[tx.category] || 0) + tx.amount;
    });
    return t;
  }

  function isOverLimit(category, totals) {
    var lim = state.limits.find(function(l){ return l.category === category; });
    if (!lim) return false;
    return (totals[category] || 0) >= lim.limit;
  }

  function sorted() {
    var o = state.sortOrder;
    return state.transactions.slice().sort(function(a, b) {
      var p = 0;
      if      (o === 'amount-desc')   p = b.amount - a.amount;
      else if (o === 'amount-asc')    p = a.amount - b.amount;
      else if (o === 'category-asc')  p = a.category.localeCompare(b.category);
      else if (o === 'category-desc') p = b.category.localeCompare(a.category);
      //else if (o === 'date-asc')      p = a.date.localeCompare(b.date);
      //else                            p = b.date.localeCompare(a.date);
      return p;
    });
  }

  function renderList() {
    var ul = document.getElementById('transaction-list');
    var totals = monthlyTotals();
    var txs = sorted();
    ul.innerHTML = '';

    if (txs.length === 0) {
      var li = document.createElement('li');
      li.className = 'empty-state';
      li.textContent = 'No transactions yet. Add one above!';
      ul.appendChild(li);
      return;
    }

    txs.forEach(function(tx) {
      var li = document.createElement('li');
      li.className = tx.type;
      if (isOverLimit(tx.category, totals)) li.classList.add('over-limit');
      li.dataset.id = tx.id;

      var info = document.createElement('div');
      info.className = 'tx-info';

      var name = document.createElement('span');
      name.className = 'tx-title';
      name.textContent = tx.title;

      var meta = document.createElement('span');
      meta.className = 'tx-meta';
      meta.textContent = tx.category;

      info.appendChild(name);
      info.appendChild(meta);

      var amt = document.createElement('span');
      amt.className = 'tx-amount';
      amt.textContent = fmt(tx.amount);

      var btn = document.createElement('button');
      btn.className = 'btn-delete';
      btn.dataset.id = tx.id;
      btn.setAttribute('aria-label', 'Delete ' + tx.title);
      btn.textContent = 'X';

      li.appendChild(info);
      li.appendChild(amt);
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  // ── Render: chart ──────────────────────────────────────────────────────────

  function renderChart() {
    var canvas = document.getElementById('spending-chart');
    var empty  = document.getElementById('chart-empty');
    var totals = monthlyTotals();

    // aggregate all-time expenses for the chart (not just this month)
    var agg = {};
    state.transactions.forEach(function(tx) {
      if (tx.type !== 'expense') return;
      agg[tx.category] = (agg[tx.category] || 0) + tx.amount;
    });

    if (state.chart) { state.chart.destroy(); state.chart = null; }

    var entries = Object.keys(agg)
      .map(function(k){ return { name: k, amount: agg[k] }; })
      .sort(function(a,b){ return b.amount - a.amount; });

    if (entries.length === 0) {
      canvas.style.display = 'none';
      empty.style.display = '';
      return;
    }

    canvas.style.display = '';
    empty.style.display = 'none';

    state.chart = new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: entries.map(function(e){ return e.name; }),
        datasets: [{
          data: entries.map(function(e){ return e.amount; }),
          backgroundColor: entries.map(function(e, i){
            return isOverLimit(e.name, totals) ? '#e74c3c' : CHART_COLORS[i % CHART_COLORS.length];
          }),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: function(ctx){ return ' ' + ctx.label + ': ' + fmt(ctx.raw); }
            }
          }
        }
      }
    });
  }

  // ── Render: categories list ────────────────────────────────────────────────

  function renderCategories() {
    var ul = document.getElementById('category-list');
    ul.innerHTML = '';
    state.categories.forEach(function(c) {
      var li = document.createElement('li');
      li.textContent = c.name;
      if (c.predefined) li.classList.add('predefined');
      ul.appendChild(li);
    });
  }


  // ── Render all ─────────────────────────────────────────────────────────────

  function renderAll() {
    renderBalance();
    renderList();
    renderChart();
  }

  // ── Event: add transaction ─────────────────────────────────────────────────

  function onAddTransaction(e) {
    e.preventDefault();
    clearErrors();

    var titleEl    = document.getElementById('tx-title');
    var amountEl   = document.getElementById('tx-amount');
    //var dateEl     = document.getElementById('tx-date');
    var categoryEl = document.getElementById('tx-category');
    //var typeEl     = document.getElementById('tx-type');

    var ok = true;

    if (!titleEl || !titleEl.value.trim()) {
      err('error-title', 'Item name is required.');
      ok = false;
    }

    var amt = parseFloat(amountEl ? amountEl.value : '');
    if (!amountEl || isNaN(amt) || amt <= 0) {
      err('error-amount', 'Enter a valid amount greater than 0.');
      ok = false;
    }

    /*if (!dateEl || !dateEl.value) {
      err('error-date', 'Date is required.');
      ok = false;
    }*/

    if (!categoryEl || !categoryEl.value) {
      err('error-category', 'Please select a category.');
      ok = false;
    }

    if (!ok) return;

    var tx = {
      id:       uid(),
      title:    titleEl.value.trim(),
      amount:   amt,
      //date:     dateEl.value,
      category: categoryEl.value,
      type:     'expense'
    };

    state.transactions.unshift(tx);
    save(KEYS.TX, state.transactions);
    renderAll();

    e.target.reset();
    //if (dateEl) dateEl.valueAsDate = new Date();
    titleEl.focus();
    toast('Transaction added!');
  }

  // ── Event: delete transaction ──────────────────────────────────────────────

  function onDeleteTransaction(id) {
    state.transactions = state.transactions.filter(function(t){ return t.id !== id; });
    save(KEYS.TX, state.transactions);
    renderAll();
  }

  // ── Event: add category ────────────────────────────────────────────────────

  function onAddCategory() {
    var input = document.getElementById('new-category-input');
    var errEl = document.getElementById('error-category-name');
    if (errEl) errEl.textContent = '';

    var name = input ? input.value.trim() : '';
    if (!name) { if (errEl) errEl.textContent = 'Category name is required.'; return; }
    if (name.length > 50) { if (errEl) errEl.textContent = 'Max 50 characters.'; return; }

    var exists = state.categories.some(function(c){
      return c.name.toLowerCase() === name.toLowerCase();
    });
    if (exists) { if (errEl) errEl.textContent = 'Category already exists.'; return; }

    state.categories.push({ name: name, predefined: false });
    save(KEYS.CAT, state.categories);
    renderCategories();
    renderCategorySelects();
    if (input) input.value = '';
    toast('Category added!');
  }

  // ── Event: set limit ───────────────────────────────────────────────────────

  function onSetLimit() {
    var catEl  = document.getElementById('limit-category-select');
    var limEl  = document.getElementById('limit-amount-input');
    var errEl  = document.getElementById('error-limit-amount');
    if (errEl) errEl.textContent = '';

    var cat = catEl ? catEl.value : '';
    var lim = parseFloat(limEl ? limEl.value : '');

    if (!cat) { if (errEl) errEl.textContent = 'Select a category.'; return; }
    if (isNaN(lim) || lim <= 0) { if (errEl) errEl.textContent = 'Enter a valid amount.'; return; }

    var existing = state.limits.find(function(l){ return l.category === cat; });
    if (existing) existing.limit = lim;
    else state.limits.push({ category: cat, limit: lim });

    save(KEYS.LIM, state.limits);
    if (limEl) limEl.value = '';
    renderList();
    renderChart();
    renderLimits();
    toast('Limit saved!');
  }

  // ── Event: clear limit ─────────────────────────────────────────────────────

  function onClearLimit(cat) {
    state.limits = state.limits.filter(function(l){ return l.category !== cat; });
    save(KEYS.LIM, state.limits);
    renderList();
    renderChart();
    renderLimits();
    toast('Limit cleared.');
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function init() {
    boot();

    var dateEl = document.getElementById('tx-date');
    if (dateEl) dateEl.valueAsDate = new Date();

    renderCategorySelects();
    renderAll();
    renderCategories();
    //renderLimits();

    // form submit
    var form = document.getElementById('add-form');
    if (form) form.addEventListener('submit', onAddTransaction);

    // delete (delegated)
    var list = document.getElementById('transaction-list');
    if (list) list.addEventListener('click', function(e) {
      var btn = e.target.closest('.btn-delete');
      if (btn) onDeleteTransaction(btn.dataset.id);
    });

    // sort
    var sortSel = document.getElementById('sort-select');
    if (sortSel) sortSel.addEventListener('change', function(e) {
      state.sortOrder = e.target.value;
      renderList();
    });

    // add category
    var addCatBtn = document.getElementById('add-category-btn');
    if (addCatBtn) addCatBtn.addEventListener('click', onAddCategory);

    var catInput = document.getElementById('new-category-input');
    if (catInput) catInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); onAddCategory(); }
    });

    // save limit
    var saveLimBtn = document.getElementById('save-limit-btn');
    if (saveLimBtn) saveLimBtn.addEventListener('click', onSetLimit);

    // clear limit (delegated)
    var limTable = document.getElementById('limits-table');
    if (limTable) limTable.addEventListener('click', function(e) {
      var btn = e.target.closest('.btn-clear-limit');
      if (btn) onClearLimit(btn.dataset.cat);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

}());