import { appState, saveDB, formatMoney } from '../store.js';

export function renderCollections() {
  var h = '<div class="glass p-5 rounded-2xl space-y-6">';
  
  // Top Summary Cards
  var totalBilledAll = appState.db.orders.filter(function(o){ return o.deliveryStatus === 'delivered'; }).reduce(function(s, o){ return s + o.amount; }, 0);
  var totalPaidAll = appState.db.payments.reduce(function(s, p){ return s + p.amount; }, 0);
  var totalDuesAll = totalBilledAll - totalPaidAll;

  h += '  <div>';
  h += '    <h2 class="text-lg font-bold text-white mb-1">Customer Collections & Settlements</h2>';
  h += '    <p class="text-xs text-gray-400">Record full or partial payments received from shop owners.</p>';
  h += '  </div>';

  h += '  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
  h += '    <div class="glass-card p-4 rounded-xl border-l-4 border-emerald-500"><p class="text-xs text-gray-400 font-bold">TOTAL BILLED SALES</p><p class="text-2xl font-bold text-white mt-1 secret-number">' + formatMoney(totalBilledAll) + '</p></div>';
  h += '    <div class="glass-card p-4 rounded-xl border-l-4 border-sky-500"><p class="text-xs text-gray-400 font-bold">TOTAL CASH COLLECTED</p><p class="text-2xl font-bold text-sky-400 mt-1 secret-number">' + formatMoney(totalPaidAll) + '</p></div>';
  h += '    <div class="glass-card p-4 rounded-xl border-l-4 border-rose-500"><p class="text-xs text-gray-400 font-bold">TOTAL OUTSTANDING DUES</p><p class="text-2xl font-bold text-rose-400 mt-1 secret-number">' + formatMoney(totalDuesAll) + '</p></div>';
  h += '  </div>';

  // Customer Settlement List
  h += '  <div class="space-y-3">';
  for (var i = 0; i < appState.db.customers.length; i++) {
    var c = appState.db.customers[i];
    var billed = appState.db.orders.filter(function(o){ return o.customerId === c.id && o.deliveryStatus === 'delivered'; }).reduce(function(s, o){ return s + o.amount; }, 0);
    var paid = appState.db.payments.filter(function(p){ return p.customerId === c.id; }).reduce(function(s, p){ return s + p.amount; }, 0);
    var bal = billed - paid;

    h += '    <div class="glass-card p-4 rounded-xl flex flex-wrap justify-between items-center gap-4 border-l-4 ' + (bal > 0 ? 'border-rose-500' : 'border-emerald-500') + '">';
    h += '      <div>';
    h += '        <h3 class="font-bold text-white text-base">' + c.name + '</h3>';
    h += '        <p class="text-xs text-gray-400 mt-0.5">Billed Deliveries: ₹' + billed.toLocaleString('en-IN') + ' | Payments Received: ₹' + paid.toLocaleString('en-IN') + '</p>';
    h += '      </div>';

    h += '      <div class="flex items-center gap-4">';
    h += '        <div class="text-right">';
    h += '          <span class="text-[10px] text-gray-400 font-bold block">CURRENT BALANCE</span>';
    h += '          <span class="text-base font-bold secret-number ' + (bal > 0 ? 'text-rose-400' : 'text-emerald-400') + '">' + (bal > 0 ? 'Owes ' + formatMoney(bal) : (bal < 0 ? 'Credit ' + formatMoney(Math.abs(bal)) : 'Settled ✓')) + '</span>';
    h += '        </div>';

    h += '        <button onclick="window.openRecordPaymentModal(\'' + c.id + '\', ' + bal + ')" class="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all">+ Record Pay</button>';
    h += '      </div>';
    h += '    </div>';
  }
  h += '  </div>';

  // Payment Recording Modal
  if (appState.showPaymentModal && appState.paymentCustomerId) {
    var payCust = appState.db.customers.find(function(c){ return c.id === appState.paymentCustomerId; });
    var custBilled = appState.db.orders.filter(function(o){ return o.customerId === payCust.id && o.deliveryStatus === 'delivered'; }).reduce(function(s, o){ return s + o.amount; }, 0);
    var custPaid = appState.db.payments.filter(function(p){ return p.customerId === payCust.id; }).reduce(function(s, p){ return s + p.amount; }, 0);
    var currentBal = custBilled - custPaid;

    h += '<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">';
    h += '  <div class="glass p-6 rounded-2xl w-full max-w-md space-y-4">';
    h += '    <h3 class="text-lg font-bold text-white">Record Settlement Payment</h3>';
    h += '    <p class="text-xs text-gray-300">Customer: <span class="font-bold text-emerald-400">' + payCust.name + '</span> (Current Due: ₹' + currentBal + ')</p>';
    
    // Amount
    h += '    <div>';
    h += '      <div class="flex justify-between items-center mb-1">';
    h += '        <label class="text-xs text-gray-400 font-bold">Amount Paid (₹)</label>';
    h += '        <button onclick="document.getElementById(\'payAmount\').value=' + (currentBal > 0 ? currentBal : 0) + '" class="text-[10px] text-emerald-400 font-bold underline">Pay Full Balance (₹' + currentBal + ')</button>';
    h += '      </div>';
    h += '      <input id="payAmount" type="number" placeholder="Enter partial or full amount" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-base font-extrabold focus:border-emerald-500 outline-none">';
    h += '    </div>';

    // Date
    h += '    <div>';
    h += '      <label class="text-xs text-gray-400 font-bold block mb-1">Payment Date</label>';
    h += '      <input id="payDate" type="date" value="' + appState.orderDate + '" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold">';
    h += '    </div>';

    // Mode
    h += '    <div>';
    h += '      <label class="text-xs text-gray-400 font-bold block mb-1">Payment Mode</label>';
    h += '      <select id="payMode" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold">';
    h += '        <option value="UPI">UPI / GPay / PhonePe</option>';
    h += '        <option value="Cash">Cash</option>';
    h += '        <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>';
    h += '        <option value="Cheque">Cheque</option>';
    h += '      </select>';
    h += '    </div>';

    // Note / Reference
    h += '    <div>';
    h += '      <label class="text-xs text-gray-400 font-bold block mb-1">UPI Ref / Note (Optional)</label>';
    h += '      <input id="payRef" type="text" placeholder="e.g. UPI Ref #983412 or Partial payment" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm">';
    h += '    </div>';

    // Actions
    h += '    <div class="flex justify-end gap-2 pt-3 border-t border-gray-800">';
    h += '      <button onclick="window.closeRecordPaymentModal()" class="px-4 py-2 bg-gray-800 text-xs rounded-xl text-gray-300">Cancel</button>';
    h += '      <button onclick="window.savePaymentRecord()" class="px-4 py-2 bg-emerald-500 text-xs rounded-xl text-white font-bold">Save Payment</button>';
    h += '    </div>';

    h += '  </div>';
    h += '</div>';
  }

  h += '</div>';

  return h;
}

export function openRecordPaymentModal(customerId) {
  appState.paymentCustomerId = customerId;
  appState.showPaymentModal = true;
  window.render();
}

export function closeRecordPaymentModal() {
  appState.showPaymentModal = false;
  appState.paymentCustomerId = null;
  window.render();
}

export function savePaymentRecord() {
  var amount = Number(document.getElementById('payAmount').value) || 0;
  var date = document.getElementById('payDate').value || appState.orderDate;
  var mode = document.getElementById('payMode').value;
  var ref = document.getElementById('payRef').value;

  if (amount <= 0) return alert("Please enter a valid payment amount.");

  appState.db.payments.push({
    id: 'p_' + Date.now(),
    customerId: appState.paymentCustomerId,
    date: date,
    amount: amount,
    mode: mode,
    reference: ref
  });

  saveDB(appState.db);
  closeRecordPaymentModal();
}