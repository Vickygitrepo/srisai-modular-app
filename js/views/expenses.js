import { appState, saveDB, formatMoney } from '../store.js';

export function renderExpenses() {
  var categories = [
    'Rice Flour', 'Shop Rent', 'Shop EB', 'Worker Place Rent', 
    'Worker EB', 'Rapido / Porter', 'Generator / Fuel', 
    'Worker Food & Snacks', 'Others'
  ];

  var totalRevenue = appState.db.orders.filter(function(o){ return o.deliveryStatus === 'delivered'; }).reduce(function(s, o){ return s + o.amount; }, 0);
  
  var filteredExpenses = appState.db.expenses;
  if (appState.expenseFilterCategory !== 'all') {
    filteredExpenses = filteredExpenses.filter(function(e){ return e.category === appState.expenseFilterCategory; });
  }

  var totalExpenses = appState.db.expenses.reduce(function(s, e){ return s + Number(e.amount || 0); }, 0);
  var netProfit = totalRevenue - totalExpenses;

  var h = '<div class="glass p-5 rounded-2xl space-y-6">';
  h += '  <div class="flex flex-wrap justify-between items-center gap-4">';
  h += '    <div><h2 class="text-lg font-bold text-white mb-1">Expenses & Net Profit Tracker</h2><p class="text-xs text-gray-400">Track operational costs to see clear profit in hand.</p></div>';
  h += '    <button onclick="window.toggleExpenseModal(true)" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"><span>+ Add New Expense</span></button>';
  h += '  </div>';

  h += '  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
  h += '    <div class="glass-card p-4 rounded-xl border-l-4 border-emerald-500"><p class="text-xs text-gray-400">TOTAL REVENUE</p><p class="text-2xl font-bold text-emerald-400 mt-1 secret-number">' + formatMoney(totalRevenue) + '</p></div>';
  h += '    <div class="glass-card p-4 rounded-xl border-l-4 border-rose-500"><p class="text-xs text-gray-400">TOTAL EXPENSES</p><p class="text-2xl font-bold text-rose-400 mt-1 secret-number">' + formatMoney(totalExpenses) + '</p></div>';
  h += '    <div class="glass-card p-4 rounded-xl border-l-4 ' + (netProfit >= 0 ? 'border-sky-500' : 'border-amber-500') + '"><p class="text-xs text-gray-400">NET PROFIT IN HAND</p><p class="text-2xl font-bold ' + (netProfit >= 0 ? 'text-sky-400' : 'text-amber-400') + ' mt-1 secret-number">' + formatMoney(netProfit) + '</p></div>';
  h += '  </div>';

  h += '  <div class="glass-card p-3 rounded-xl flex items-center justify-between gap-4"><span class="text-xs text-gray-400 font-bold">Filter Category:</span><select onchange="window.setExpenseFilterCategory(this.value)" class="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-1.5"><option value="all">All Categories</option>';
  for (var c = 0; c < categories.length; c++) {
    var cat = categories[c];
    h += '      <option value="' + cat + '" ' + (appState.expenseFilterCategory === cat ? 'selected' : '') + '>' + cat + '</option>';
  }
  h += '  </select></div>';

  h += '  <div class="space-y-3">';
  if (filteredExpenses.length === 0) {
    h += '    <p class="text-xs text-gray-500 text-center py-6">No expense records found for this filter.</p>';
  }
  for (var i = 0; i < filteredExpenses.length; i++) {
    var e = filteredExpenses[i];
    var linkedCust = appState.db.customers.find(function(c){ return c.id === e.customerId; });
    var shopTag = linkedCust ? ' • ' + linkedCust.name : '';

    h += '    <div class="glass-card p-4 rounded-xl flex justify-between items-center gap-4">';
    h += '      <div><span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">' + e.category + '</span><p class="font-bold text-white text-sm mt-1.5">' + (e.note || e.category) + shopTag + '</p><p class="text-xs text-gray-400 mt-0.5">' + e.date + '</p></div>';
    h += '      <div class="flex items-center gap-3"><span class="font-bold text-rose-400 text-base secret-number">₹' + e.amount + '</span><button onclick="window.deleteExpense(\'' + e.id + '\')" title="Delete Expense" class="text-gray-500 hover:text-rose-400 p-1.5 text-xs font-bold bg-gray-800 rounded-lg">✕</button></div>';
    h += '    </div>';
  }
  h += '  </div>';
  h += '</div>';

  if (appState.showExpenseModal) {
    h += '<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div class="glass p-6 rounded-2xl w-full max-w-md space-y-4"><h3 class="text-lg font-bold text-white">Record New Expense</h3>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Expense Category</label><select id="expCategory" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm">';
    for (var k = 0; k < categories.length; k++) {
      h += '        <option value="' + categories[k] + '">' + categories[k] + '</option>';
    }
    h += '    </select></div>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Amount (₹)</label><input id="expAmount" type="number" placeholder="e.g. 1200" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-bold"></div>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Date</label><input id="expDate" type="date" value="' + appState.orderDate + '" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm"></div>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Link to Shop / Hotel (Optional)</label><select id="expShop" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm"><option value="">-- General / Business Expense --</option>';
    for (var s = 0; s < appState.db.customers.length; s++) {
      var shop = appState.db.customers[s];
      h += '        <option value="' + shop.id + '">' + shop.name + '</option>';
    }
    h += '    </select></div>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Note / Description</label><input id="expNote" type="text" placeholder="e.g. 50kg bag, Electric bill, Worker snacks" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm"></div>';
    h += '    <div class="flex justify-end gap-2 pt-2"><button onclick="window.toggleExpenseModal(false)" class="px-4 py-2 bg-gray-800 text-xs rounded-xl text-gray-300">Cancel</button><button onclick="window.saveNewExpense()" class="px-4 py-2 bg-emerald-500 text-xs rounded-xl text-white font-bold">Save Expense</button></div>';
    h += '  </div></div>';
  }

  return h;
}

export function toggleExpenseModal(show) { appState.showExpenseModal = show; window.render(); }
export function setExpenseFilterCategory(cat) { appState.expenseFilterCategory = cat; window.render(); }

export function saveNewExpense() {
  var category = document.getElementById('expCategory').value;
  var amount = Number(document.getElementById('expAmount').value) || 0;
  var date = document.getElementById('expDate').value || appState.orderDate;
  var shopId = document.getElementById('expShop').value;
  var note = document.getElementById('expNote').value;

  if (amount <= 0) return alert("Please enter a valid expense amount.");

  appState.db.expenses.push({
    id: 'e_' + Date.now(),
    category: category,
    amount: amount,
    date: date,
    customerId: shopId,
    note: note
  });

  saveDB(appState.db);
  toggleExpenseModal(false);
}

export function deleteExpense(expId) {
  if (confirm("Are you sure you want to delete this expense entry?")) {
    appState.db.expenses = appState.db.expenses.filter(function(e){ return e.id !== expId; });
    saveDB(appState.db);
    window.render();
  }
}