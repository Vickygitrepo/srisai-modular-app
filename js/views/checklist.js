import { appState, saveDB } from '../store.js';

export function renderChecklist() {
  var h = '<div class="glass p-5 rounded-2xl space-y-4">';
  h += '  <div><h2 class="text-lg font-bold text-white mb-1">Today\'s Delivery Checklist</h2><p class="text-xs text-gray-400">Tap any item to toggle between Delivered and Pending (Undo anytime).</p></div>';

  h += '  <div class="space-y-3">';
  for (var i = 0; i < appState.db.customers.length; i++) {
    var c = appState.db.customers[i];
    if (!c.isActive) continue;

    var ord = appState.db.orders.find(function(o){ 
      return o.customerId === c.id && o.date === appState.orderDate && o.shift === appState.orderShift; 
    });

    var pieces = ord ? ord.pieces : c.defaultMorningQty;
    var isDelivered = ord && ord.deliveryStatus === 'delivered';

    h += '    <div class="glass-card p-4 rounded-xl flex justify-between items-center transition-all ' + (isDelivered ? 'border-l-4 border-emerald-500' : 'border-l-4 border-gray-700') + '">';
    h += '      <div><p class="font-bold text-white text-base">' + c.name + '</p><p class="text-xs text-gray-400 mt-0.5">' + pieces + ' Pieces • ' + appState.orderShift.toUpperCase() + ' SHIFT</p></div>';

    if (isDelivered) {
      h += '      <button onclick="window.toggleDeliveryStatus(\'' + (ord ? ord.id : '') + '\', \'' + c.id + '\', false)" class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center gap-1"><span>✓ DELIVERED</span> <span class="text-[10px] opacity-75">(Tap to Undo)</span></button>';
    } else {
      h += '      <button onclick="window.toggleDeliveryStatus(\'' + (ord ? ord.id : '') + '\', \'' + c.id + '\', true)" class="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 text-gray-300 hover:bg-emerald-500 hover:text-white transition-all">MARK DELIVERED</button>';
    }

    h += '    </div>';
  }
  h += '  </div>';
  h += '</div>';

  return h;
}

export function toggleDeliveryStatus(orderId, customerId, markDelivered) {
  var ord = appState.db.orders.find(function(o){ return o.id === orderId; });

  if (ord) {
    ord.deliveryStatus = markDelivered ? 'delivered' : 'pending';
  } else {
    var cust = appState.db.customers.find(function(c){ return c.id === customerId; });
    var pcs = cust ? (appState.orderShift === 'morning' ? cust.defaultMorningQty : cust.defaultEveningQty) : 100;
    var rate = cust ? cust.unitRate : 7;

    appState.db.orders.push({
      id: 'o_' + Date.now() + '_' + customerId,
      customerId: customerId,
      date: appState.orderDate,
      shift: appState.orderShift,
      pieces: pcs,
      unitRateApplied: rate,
      amount: pcs * rate,
      deliveryStatus: markDelivered ? 'delivered' : 'pending',
      rapidoCharge: 0
    });
  }

  saveDB(appState.db);
  window.render();
}