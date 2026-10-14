import { appState, saveDB, formatMoney } from '../store.js';

export function renderOrders() {
  var d = new Date(appState.orderDate);
  var isTuesday = d.getDay() === 2;
  if (isTuesday && appState.orderShift === 'evening') {
    appState.orderShift = 'morning';
  }

  var h = '<div class="glass p-5 rounded-2xl space-y-6">';
  h += '  <div><h2 class="text-lg font-bold text-white mb-1">Quick Shift Order Entry</h2><p class="text-xs text-gray-400">Enter pieces supplied and Rapido/Porter charges paid by you.</p></div>';

  // Controls Bar
  h += '  <div class="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">';
  h += '    <div class="flex items-center gap-2"><label class="text-xs text-gray-400 font-bold">Order Date:</label><input type="date" value="' + appState.orderDate + '" onchange="window.setOrderDate(this.value)" class="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-2 font-semibold"></div>';
  h += '    <div class="flex items-center gap-2"><span class="text-xs text-gray-400 font-bold mr-1">Shift:</span>';
  
  var isMorn = appState.orderShift === 'morning';
  h += '      <button onclick="window.setOrderShift(\'morning\')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ' + (isMorn ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-800 text-gray-400') + '">☀️ MORNING</button>';

  var isEve = appState.orderShift === 'evening';
  if (isTuesday) {
    h += '      <button disabled class="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800/40 text-gray-600 cursor-not-allowed">🌙 EVENING (TUESDAY OFF)</button>';
  } else {
    h += '      <button onclick="window.setOrderShift(\'evening\')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ' + (isEve ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 text-gray-400') + '">🌙 EVENING</button>';
  }
  h += '    </div></div>';

  // Customer Entry Rows
  h += '  <div class="space-y-4">';
  for (var i = 0; i < appState.db.customers.length; i++) {
    var c = appState.db.customers[i];
    if (!c.isActive) continue;

    var defaultQty = appState.orderShift === 'morning' ? c.defaultMorningQty : c.defaultEveningQty;

    h += '    <div class="glass-card p-4 rounded-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-4">';
    h += '      <div><p class="font-bold text-white text-base">' + c.name + '</p><p class="text-xs text-emerald-400 font-medium">Rate: ₹' + c.unitRate + '/piece</p></div>';
    h += '      <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">';
    h += '        <div><label class="text-[10px] text-gray-400 font-bold block mb-1">PIECES</label><input id="qty_' + c.id + '" data-rate="' + c.unitRate + '" type="number" value="' + defaultQty + '" oninput="window.recalculateOrderTotals()" class="qty-input w-24 bg-gray-900 border border-gray-700 text-white text-center font-bold px-3 py-2 rounded-xl focus:border-emerald-500 outline-none"></div>';
    h += '        <div><label class="text-[10px] text-gray-400 font-bold block mb-1">RAPIDO/PORTER (₹)</label><input id="rapido_' + c.id + '" type="number" placeholder="0" oninput="window.recalculateOrderTotals()" class="rapido-input w-24 bg-gray-900 border border-gray-700 text-amber-400 text-center font-bold px-3 py-2 rounded-xl focus:border-amber-500 outline-none"></div>';
    h += '      </div>';
    h += '    </div>';
  }
  h += '  </div>';

  // Live Summary Bar
  h += '  <div class="glass-card p-4 rounded-xl border border-emerald-500/30 flex flex-wrap justify-between items-center gap-4 bg-emerald-950/20">';
  h += '    <div><p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Shift Summary (' + appState.orderShift.toUpperCase() + ')</p><p class="text-xs text-gray-400 mt-0.5">Live calculation of current entry</p></div>';
  h += '    <div class="flex items-center gap-6">';
  h += '      <div class="text-center"><p class="text-[10px] text-gray-400 font-bold">TOTAL PIECES</p><p id="totalPcsSummary" class="text-2xl font-extrabold text-white">0 Pcs</p></div>';
  h += '      <div class="text-center border-l border-gray-800 pl-6"><p class="text-[10px] text-gray-400 font-bold">TOTAL VALUE</p><p id="totalValSummary" class="text-2xl font-extrabold text-emerald-400 secret-number">₹0</p></div>';
  h += '      <div class="text-center border-l border-gray-800 pl-6"><p class="text-[10px] text-gray-400 font-bold">DELIVERY CHARGES</p><p id="totalRapidoSummary" class="text-2xl font-extrabold text-amber-400 secret-number">₹0</p></div>';
  h += '    </div>';
  h += '  </div>';

  h += '  <button onclick="window.saveOrdersBatch()" class="w-full bg-emerald-500 hover:bg-emerald-600 font-bold text-white py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 text-sm tracking-wide">SAVE ' + appState.orderShift.toUpperCase() + ' SHIFT ORDERS</button>';
  h += '</div>';

  return h;
}

export function recalculateOrderTotals() {
  var qtyInputs = document.querySelectorAll('.qty-input');
  var rapidoInputs = document.querySelectorAll('.rapido-input');

  var totalPcs = 0;
  var totalVal = 0;
  var totalRapido = 0;

  qtyInputs.forEach(function(input) {
    var pcs = Number(input.value) || 0;
    var rate = Number(input.getAttribute('data-rate')) || 7;
    totalPcs += pcs;
    totalVal += (pcs * rate);
  });

  rapidoInputs.forEach(function(input) {
    totalRapido += (Number(input.value) || 0);
  });

  var pcsElem = document.getElementById('totalPcsSummary');
  var valElem = document.getElementById('totalValSummary');
  var rapElem = document.getElementById('totalRapidoSummary');

  if (pcsElem) pcsElem.innerText = totalPcs.toLocaleString('en-IN') + ' Pcs';
  if (valElem) valElem.innerText = formatMoney(totalVal);
  if (rapElem) rapElem.innerText = formatMoney(totalRapido);
}

export function saveOrdersBatch() {
  for (var i = 0; i < appState.db.customers.length; i++) {
    var c = appState.db.customers[i];
    if (!c.isActive) continue;

    var qtyInput = document.getElementById('qty_' + c.id);
    var rapidoInput = document.getElementById('rapido_' + c.id);

    var pcs = qtyInput ? (Number(qtyInput.value) || 0) : 0;
    var rapido = rapidoInput ? (Number(rapidoInput.value) || 0) : 0;

    if (pcs > 0) {
      appState.db.orders.push({
        id: 'o_' + Date.now() + '_' + c.id,
        customerId: c.id,
        date: appState.orderDate,
        shift: appState.orderShift,
        pieces: pcs,
        unitRateApplied: c.unitRate,
        amount: pcs * c.unitRate,
        deliveryStatus: 'delivered',
        rapidoCharge: rapido
      });

      if (rapido > 0) {
        appState.db.expenses.push({
          id: 'e_' + Date.now() + '_' + c.id,
          category: 'Rapido / Porter',
          amount: rapido,
          date: appState.orderDate,
          customerId: c.id,
          note: 'Delivery fee for ' + c.name + ' (' + appState.orderShift + ')'
        });
      }
    }
  }

  saveDB(appState.db);
  alert("Shift orders and delivery expenses saved successfully!");
  window.render();
}