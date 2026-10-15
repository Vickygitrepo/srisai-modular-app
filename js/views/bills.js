import { appState, formatMoney } from '../store.js';

export function renderBills() {
  var selected = appState.db.customers[0];
  for (var i = 0; i < appState.db.customers.length; i++) {
    if (appState.db.customers[i].id === appState.billShop) {
      selected = appState.db.customers[i];
    }
  }

  if (!selected) {
    return '<div class="glass p-5 rounded-2xl text-white">No shops available. Please add a shop first.</div>';
  }

  // 1. Calculate Date Filtering
  var filteredOrders = appState.db.orders.filter(function(o){ 
    return o.customerId === selected.id && o.deliveryStatus === 'delivered'; 
  });

  var todayStr = new Date().toISOString().slice(0, 10);

  if (appState.billRangeMode === 'today') {
    filteredOrders = filteredOrders.filter(function(o){ return o.date === todayStr; });
  } else if (appState.billRangeMode === 'thisWeek') {
    var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    filteredOrders = filteredOrders.filter(function(o){ return o.date >= sevenDaysAgo && o.date <= todayStr; });
  } else if (appState.billRangeMode === 'last15Days') {
    var fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    filteredOrders = filteredOrders.filter(function(o){ return o.date >= fifteenDaysAgo && o.date <= todayStr; });
  } else if (appState.billRangeMode === 'custom' && appState.billStartDate && appState.billEndDate) {
    filteredOrders = filteredOrders.filter(function(o){ return o.date >= appState.billStartDate && o.date <= appState.billEndDate; });
  }

  // Sort orders chronologically
  filteredOrders.sort(function(a, b){ return a.date.localeCompare(b.date); });

  // 2. Compute Period Figures
  var periodPieces = filteredOrders.reduce(function(s, o){ return s + o.pieces; }, 0);
  var periodBilledAmt = filteredOrders.reduce(function(s, o){ return s + o.amount; }, 0);

  // 3. Compute Overall Account Ledger (Previous Dues & Payments)
  var totalDeliveredAllTime = appState.db.orders.filter(function(o){ 
    return o.customerId === selected.id && o.deliveryStatus === 'delivered'; 
  }).reduce(function(s, o){ return s + o.amount; }, 0);

  var totalPaidAllTime = appState.db.payments.filter(function(p){ 
    return p.customerId === selected.id; 
  }).reduce(function(s, p){ return s + p.amount; }, 0);

  var totalOutstandingOverall = totalDeliveredAllTime - totalPaidAllTime;
  var previousPendingBalance = totalOutstandingOverall - periodBilledAmt;

  var h = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';

  // LEFT CONTROLS PANEL
  h += '<div class="glass p-5 rounded-2xl space-y-4">';
  h += '  <h2 class="text-lg font-bold text-white">Bill Generator</h2>';
  
  // Shop Selector
  h += '  <div>';
  h += '    <label class="text-xs text-gray-400 font-bold block mb-1">Select Shop / Customer</label>';
  h += '    <select onchange="window.setBillShop(this.value)" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold">';
  for (var j = 0; j < appState.db.customers.length; j++) {
    var c = appState.db.customers[j];
    h += '      <option value="' + c.id + '" ' + (selected.id === c.id ? 'selected' : '') + '>' + c.name + '</option>';
  }
  h += '    </select>';
  h += '  </div>';

  // Date Range Filter Dropdown
  h += '  <div>';
  h += '    <label class="text-xs text-gray-400 font-bold block mb-1">Bill Date Range</label>';
  h += '    <select onchange="window.setBillRangeMode(this.value)" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold">';
  h += '      <option value="thisMonth" ' + (appState.billRangeMode === 'thisMonth' ? 'selected' : '') + '>This Month</option>';
  h += '      <option value="today" ' + (appState.billRangeMode === 'today' ? 'selected' : '') + '>Today Only</option>';
  h += '      <option value="thisWeek" ' + (appState.billRangeMode === 'thisWeek' ? 'selected' : '') + '>Last 7 Days (Weekly)</option>';
  h += '      <option value="last15Days" ' + (appState.billRangeMode === 'last15Days' ? 'selected' : '') + '>Last 15 Days</option>';
  h += '      <option value="custom" ' + (appState.billRangeMode === 'custom' ? 'selected' : '') + '>Custom Date Range</option>';
  h += '    </select>';
  h += '  </div>';

  if (appState.billRangeMode === 'custom') {
    h += '  <div class="space-y-2 pt-1 border-t border-gray-800">';
    h += '    <div><label class="text-[10px] text-gray-400 font-bold">Start Date</label><input type="date" value="' + (appState.billStartDate || '') + '" onchange="window.setBillStartDate(this.value)" class="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-1.5 font-semibold"></div>';
    h += '    <div><label class="text-[10px] text-gray-400 font-bold">End Date</label><input type="date" value="' + (appState.billEndDate || '') + '" onchange="window.setBillEndDate(this.value)" class="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-1.5 font-semibold"></div>';
    h += '  </div>';
  }

  // Account Ledger Summary Card
  h += '  <div class="glass-card p-3 rounded-xl space-y-1.5 border border-emerald-500/20 text-xs">';
  h += '    <div class="flex justify-between text-gray-400"><span>Period Deliveries:</span><span class="text-white font-bold secret-number">' + formatMoney(periodBilledAmt) + '</span></div>';
  h += '    <div class="flex justify-between text-gray-400"><span>Previous Dues:</span><span class="text-amber-400 font-bold secret-number">' + formatMoney(previousPendingBalance) + '</span></div>';
  h += '    <div class="flex justify-between text-gray-400"><span>Total Received Paid:</span><span class="text-sky-400 font-bold secret-number">' + formatMoney(totalPaidAllTime) + '</span></div>';
  h += '    <div class="flex justify-between text-white font-bold pt-1.5 border-t border-gray-800"><span>NET OUTSTANDING:</span><span class="text-rose-400 text-sm secret-number">' + formatMoney(totalOutstandingOverall) + '</span></div>';
  h += '  </div>';

  // Action Buttons
  h += '  <div class="space-y-2 pt-2">';
  h += '    <button onclick="window.sendWhatsAppDetailedBill()" class="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-white py-3 rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-2">📲 Share Table Bill on WhatsApp</button>';
  h += '    <button onclick="window.downloadBillCardPNG()" class="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2.5 rounded-xl border border-gray-700 text-xs">📷 Download Bill Image (PNG)</button>';
  h += '  </div>';

  h += '</div>';

  // RIGHT BILL CARD PREVIEW
  h += '<div class="md:col-span-2">';
  h += '  <div id="billCard" class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">';
  
  // Header
  h += '    <div class="border-b border-slate-800 pb-4 flex justify-between items-start">';
  h += '      <div>';
  h += '        <h1 class="text-xl font-extrabold text-emerald-400 tracking-wider">IDIYAPPAM BILL</h1>';
  h += '        <p class="text-xs text-slate-300 font-bold mt-0.5">' + appState.db.settings.businessName + '</p>';
  h += '        <p class="text-[11px] text-slate-500">Ph: ' + appState.db.settings.ownerPhone + ' | UPI: ' + appState.db.settings.upiId + '</p>';
  h += '      </div>';
  h += '      <div class="text-right">';
  h += '        <span class="text-sm font-bold text-white block">' + selected.name + '</span>';
  h += '        <span class="text-xs text-slate-400">' + selected.ownerPhone + '</span>';
  if (selected.address) {
    h += '      <p class="text-[10px] text-slate-500 mt-0.5">' + selected.address + '</p>';
  }
  h += '      </div>';
  h += '    </div>';

  // Bill Item Table
  h += '    <table class="w-full text-left text-xs">';
  h += '      <thead>';
  h += '        <tr class="border-b border-slate-800 text-slate-400 font-bold">';
  h += '          <th class="py-2">Date</th>';
  h += '          <th class="py-2">Shift</th>';
  h += '          <th class="py-2 text-center">Pieces</th>';
  h += '          <th class="py-2 text-right">Rate</th>';
  h += '          <th class="py-2 text-right">Amount</th>';
  h += '        </tr>';
  h += '      </thead>';
  h += '      <tbody class="divide-y divide-slate-800/60 text-slate-200">';
  if (filteredOrders.length === 0) {
    h += '      <tr><td colspan="5" class="py-4 text-center text-slate-500">No delivered orders in this selected period.</td></tr>';
  }
  for (var k = 0; k < filteredOrders.length; k++) {
    var ord = filteredOrders[k];
    h += '      <tr>';
    h += '        <td class="py-2.5 font-medium">' + ord.date + '</td>';
    h += '        <td class="py-2.5 capitalize text-slate-400">' + ord.shift + '</td>';
    h += '        <td class="py-2.5 text-center font-semibold text-white">' + ord.pieces + '</td>';
    h += '        <td class="py-2.5 text-right text-slate-400">₹' + ord.unitRateApplied + '</td>';
    h += '        <td class="py-2.5 text-right font-bold text-emerald-400">₹' + ord.amount + '</td>';
    h += '      </tr>';
  }
  h += '      </tbody>';
  h += '    </table>';

  // Financial Ledger Breakdown
  h += '    <div class="border-t-2 border-slate-800 pt-4 space-y-2 text-xs">';
  h += '      <div class="flex justify-between text-slate-400"><span>Period Total Pieces:</span><span class="font-bold text-white">' + periodPieces + ' Pcs</span></div>';
  h += '      <div class="flex justify-between text-slate-400"><span>Period Deliveries Amount:</span><span class="font-bold text-white secret-number">' + formatMoney(periodBilledAmt) + '</span></div>';
  if (previousPendingBalance > 0) {
    h += '    <div class="flex justify-between text-amber-400/90 font-medium"><span>+ Previous Unsettled Pending Balance:</span><span class="font-bold secret-number">' + formatMoney(previousPendingBalance) + '</span></div>';
  }
  h += '      <div class="flex justify-between text-sky-400/90 font-medium"><span>- Total Settlements / Cash Paid:</span><span class="font-bold secret-number">' + formatMoney(totalPaidAllTime) + '</span></div>';
  h += '      <div class="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-extrabold text-white">';
  h += '        <span>TOTAL OUTSTANDING DUE:</span>';
  h += '        <span class="text-2xl text-rose-400 secret-number">' + formatMoney(totalOutstandingOverall) + '</span>';
  h += '      </div>';
  h += '    </div>';

  h += '  </div>';
  h += '</div>';

  h += '</div>';

  return h;
}

export function setBillShop(val) {
  appState.billShop = val;
  window.render();
}

export function setBillRangeMode(val) {
  appState.billRangeMode = val;
  window.render();
}

export function setBillStartDate(val) {
  appState.billStartDate = val;
  window.render();
}

export function setBillEndDate(val) {
  appState.billEndDate = val;
  window.render();
}

export function sendWhatsAppDetailedBill() {
  var selected = appState.db.customers.find(function(c){ return c.id === appState.billShop; });
  if (!selected) return alert("Select a shop first.");

  var filteredOrders = appState.db.orders.filter(function(o){ 
    return o.customerId === selected.id && o.deliveryStatus === 'delivered'; 
  });

  var todayStr = new Date().toISOString().slice(0, 10);

  if (appState.billRangeMode === 'today') {
    filteredOrders = filteredOrders.filter(function(o){ return o.date === todayStr; });
  } else if (appState.billRangeMode === 'thisWeek') {
    var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    filteredOrders = filteredOrders.filter(function(o){ return o.date >= sevenDaysAgo && o.date <= todayStr; });
  } else if (appState.billRangeMode === 'last15Days') {
    var fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    filteredOrders = filteredOrders.filter(function(o){ return o.date >= fifteenDaysAgo && o.date <= todayStr; });
  } else if (appState.billRangeMode === 'custom' && appState.billStartDate && appState.billEndDate) {
    filteredOrders = filteredOrders.filter(function(o){ return o.date >= appState.billStartDate && o.date <= appState.billEndDate; });
  }

  filteredOrders.sort(function(a, b){ return a.date.localeCompare(b.date); });

  var periodPieces = filteredOrders.reduce(function(s, o){ return s + o.pieces; }, 0);
  var periodBilledAmt = filteredOrders.reduce(function(s, o){ return s + o.amount; }, 0);

  var totalDeliveredAllTime = appState.db.orders.filter(function(o){ 
    return o.customerId === selected.id && o.deliveryStatus === 'delivered'; 
  }).reduce(function(s, o){ return s + o.amount; }, 0);

  var totalPaidAllTime = appState.db.payments.filter(function(p){ 
    return p.customerId === selected.id; 
  }).reduce(function(s, p){ return s + p.amount; }, 0);

  var totalOutstandingOverall = totalDeliveredAllTime - totalPaidAllTime;
  var previousPendingBalance = totalOutstandingOverall - periodBilledAmt;

  // Build Rich Multi-line Table WhatsApp Message
  var msg = "*" + appState.db.settings.businessName.toUpperCase() + " - IDIYAPPAM BILL*\n";
  msg += "Customer: *" + selected.name + "*\n";
  msg += "Phone: " + selected.ownerPhone + "\n\n";
  msg += "----------------------------------\n";
  msg += "DATE       | SHIFT | PCS | AMT\n";
  msg += "----------------------------------\n";

  if (filteredOrders.length === 0) {
    msg += "No delivered orders in period.\n";
  } else {
    for (var i = 0; i < filteredOrders.length; i++) {
      var o = filteredOrders[i];
      var shiftShort = o.shift === 'morning' ? 'Morn' : 'Eve';
      msg += o.date + " | " + shiftShort + "  | " + o.pieces + " | ₹" + o.amount + "\n";
    }
  }

  msg += "----------------------------------\n";
  msg += "Period Total: " + periodPieces + " Pcs = ₹" + periodBilledAmt + "\n";
  if (previousPendingBalance > 0) {
    msg += "Previous Pending Dues: ₹" + previousPendingBalance + "\n";
  }
  msg += "Total Settlements Paid: ₹" + totalPaidAllTime + "\n";
  msg += "----------------------------------\n";
  msg += "*TOTAL OUTSTANDING DUE: ₹" + totalOutstandingOverall + "*\n\n";
  msg += "Pay via UPI to: *" + appState.db.settings.upiId + "*\n";
  msg += "Thank you for your business!";

  var url = "https://wa.me/91" + selected.ownerPhone + "?text=" + encodeURIComponent(msg);
  window.open(url, '_blank');
}

export function downloadBillCardPNG() {
  var card = document.getElementById('billCard');
  if (!card) return alert("Bill preview card not found.");
  
  if (typeof html2canvas !== 'undefined') {
    html2canvas(card, { scale: 2 }).then(function(canvas) {
      var link = document.createElement('a');
      link.download = 'idiyappam-bill-' + Date.now() + '.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  } else {
    alert("Image export library loading. Please try again in 5 seconds.");
  }
}