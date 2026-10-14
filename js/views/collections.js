import { appState, saveDB, formatMoney } from '../store.js';

export function renderCollections() {
  var h = '<div class="glass p-5 rounded-2xl"><h2 class="text-lg font-bold text-white mb-4">Customer Collections & Balances</h2><div class="space-y-3">';
  for (var i = 0; i < appState.db.customers.length; i++) {
    var c = appState.db.customers[i];
    var billed = appState.db.orders.filter(function(o){ return o.customerId === c.id && o.deliveryStatus === 'delivered'; }).reduce(function(s, o){ return s + o.amount; }, 0);
    var paid = appState.db.payments.filter(function(p){ return p.customerId === c.id; }).reduce(function(s, p){ return s + p.amount; }, 0);
    var bal = billed - paid;

    h += '<div class="glass-card p-4 rounded-xl flex justify-between items-center">';
    h += '  <div><p class="font-bold text-white">' + c.name + '</p><p class="text-xs text-gray-400">Total Billed: ₹' + billed + ' | Total Paid: ₹' + paid + '</p></div>';
    h += '  <div class="text-right">';
    h += '    <span class="block text-sm font-bold secret-number ' + (bal > 0 ? 'text-rose-400' : 'text-emerald-400') + '">' + (bal > 0 ? 'Owes ' + formatMoney(bal) : 'Settled') + '</span>';
    h += '    <button onclick="window.recordPaymentPrompt(\'' + c.id + '\', ' + bal + ')" class="mt-1 px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium">+ Record Payment</button>';
    h += '  </div>';
    h += '</div>';
  }
  h += '</div></div>';
  return h;
}

export function recordPaymentPrompt(customerId, currentBalance) {
  var amount = prompt("Enter payment amount received (₹):", currentBalance > 0 ? currentBalance : "");
  if (amount && !isNaN(amount) && Number(amount) > 0) {
    appState.db.payments.push({
      id: 'p_' + Date.now(),
      customerId: customerId,
      date: appState.orderDate,
      amount: Number(amount),
      mode: 'UPI'
    });
    saveDB(appState.db);
    alert("Payment recorded successfully!");
    window.render();
  }
}