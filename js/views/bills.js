import { appState, formatMoney } from '../store.js';

export function renderBills() {
  var selected = appState.db.customers[0];
  for (var i = 0; i < appState.db.customers.length; i++) {
    if (appState.db.customers[i].id === appState.billShop) selected = appState.db.customers[i];
  }

  var orders = appState.db.orders.filter(function(o){ return o.customerId === selected.id && o.deliveryStatus === 'delivered'; });
  var totalAmt = orders.reduce(function(s, o){ return s + o.amount; }, 0);
  var totalPcs = orders.reduce(function(s, o){ return s + o.pieces; }, 0);

  var h = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">';
  h += '<div class="glass p-5 rounded-2xl space-y-4">';
  h += '  <h2 class="text-lg font-bold text-white">Select Shop</h2>';
  h += '  <select onchange="window.setBillShop(this.value)" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm">';
  for (var j = 0; j < appState.db.customers.length; j++) {
    var c = appState.db.customers[j];
    h += '    <option value="' + c.id + '" ' + (selected.id === c.id ? 'selected' : '') + '>' + c.name + '</option>';
  }
  h += '  </select>';
  h += '  <button onclick="window.shareWhatsApp(\'' + selected.name + '\', \'' + selected.ownerPhone + '\', ' + totalPcs + ', ' + totalAmt + ')" class="w-full bg-emerald-500 font-bold text-white py-3 rounded-xl shadow-lg mt-4">📲 Share on WhatsApp</button>';
  h += '</div>';

  h += '<div class="md:col-span-2">';
  h += '  <div id="billCard" class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">';
  h += '    <div class="border-b border-slate-800 pb-4 mb-4 flex justify-between items-start">';
  h += '      <div><h1 class="text-xl font-extrabold text-emerald-400">IDIYAPPAM BILL</h1><p class="text-xs text-slate-400 font-bold">' + appState.db.settings.businessName + '</p></div>';
  h += '      <div class="text-right"><span class="text-xs font-bold text-slate-300 block">' + selected.name + '</span><span class="text-xs text-slate-500">' + selected.ownerPhone + '</span></div>';
  h += '    </div>';
  h += '    <table class="w-full text-left text-xs mb-6">';
  h += '      <thead><tr class="border-b border-slate-800 text-slate-400"><th class="py-2">Date</th><th class="py-2">Shift</th><th class="py-2 text-center">Pieces</th><th class="py-2 text-right">Amount</th></tr></thead>';
  h += '      <tbody class="divide-y divide-slate-800/60 text-slate-200">';
  for (var k = 0; k < orders.length; k++) {
    var o = orders[k];
    h += '        <tr><td class="py-2">' + o.date + '</td><td class="py-2 capitalize">' + o.shift + '</td><td class="py-2 text-center">' + o.pieces + '</td><td class="py-2 text-right font-bold text-emerald-400">₹' + o.amount + '</td></tr>';
  }
  h += '      </tbody>';
  h += '    </table>';
  h += '    <div class="border-t-2 border-slate-800 pt-4 flex justify-between items-center">';
  h += '      <div><p class="text-xs text-slate-400">Total Pieces</p><p class="text-lg font-bold text-white">' + totalPcs + ' Pcs</p></div>';
  h += '      <div class="text-right"><p class="text-xs text-slate-400">TOTAL DUE</p><p class="text-2xl font-extrabold text-emerald-400 secret-number">' + formatMoney(totalAmt) + '</p></div>';
  h += '    </div>';
  h += '  </div>';
  h += '</div>';
  h += '</div>';

  return h;
}

export function setBillShop(val) { appState.billShop = val; window.render(); }

export function shareWhatsApp(name, phone, pcs, amt) {
  var msg = "*IDIYAPPAM BILL - " + appState.db.settings.businessName + "*\n\nShop: " + name + "\nTotal Pieces: " + pcs + "\n*Total Amount Due: ₹" + amt + "*\n\nThank you!";
  window.open("https://wa.me/91" + phone + "?text=" + encodeURIComponent(msg), '_blank');
}