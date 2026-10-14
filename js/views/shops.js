import { appState, saveDB } from '../store.js';

export function renderShops() {
  var h = '<div class="glass p-5 rounded-2xl space-y-6">';
  h += '  <div class="flex justify-between items-center flex-wrap gap-4">';
  h += '    <div><h2 class="text-lg font-bold text-white mb-1">Shops & Customer Directory</h2><p class="text-xs text-gray-400">Manage rates, WhatsApp numbers, delivery locations, and shift defaults.</p></div>';
  h += '    <button onclick="window.openAddShopModal()" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs rounded-xl shadow-lg shadow-emerald-500/20">+ Add New Shop</button>';
  h += '  </div>';

  h += '  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  for (var i = 0; i < appState.db.customers.length; i++) {
    var c = appState.db.customers[i];
    
    h += '    <div class="glass-card p-4 rounded-xl flex flex-col justify-between space-y-3">';
    h += '      <div>';
    h += '        <div class="flex justify-between items-start gap-2"><span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">' + (c.type || 'Hotel') + '</span><span class="text-xs font-bold px-2 py-0.5 rounded ' + (c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400') + '">' + (c.isActive ? 'Active' : 'Inactive') + '</span></div>';
    h += '        <h3 class="font-bold text-white text-base mt-2">' + c.name + '</h3>';
    h += '        <p class="text-xs text-gray-300 mt-1">📱 WhatsApp: <span class="font-semibold text-white">' + c.ownerPhone + '</span></p>';
    if (c.address) {
      h += '        <p class="text-xs text-gray-400 mt-0.5">📍 Location: ' + c.address + '</p>';
    }
    h += '        <p class="text-xs text-emerald-400 font-semibold mt-1">Unit Rate: ₹' + c.unitRate + '/piece</p>';
    h += '        <p class="text-[11px] text-gray-500 mt-0.5">Defaults: Morning ' + (c.defaultMorningQty || 100) + ' pcs | Evening ' + (c.defaultEveningQty || 50) + ' pcs</p>';
    h += '      </div>';

    h += '      <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-800/80">';
    h += '        <button onclick="window.toggleShopStatus(\'' + c.id + '\')" class="px-2.5 py-1 text-xs rounded-lg font-semibold bg-gray-800 text-gray-300 hover:text-white">' + (c.isActive ? 'Deactivate' : 'Activate') + '</button>';
    h += '        <button onclick="window.openEditShopModal(\'' + c.id + '\')" class="px-3 py-1 text-xs rounded-lg font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all">✏️ Edit</button>';
    h += '        <button onclick="window.deleteShop(\'' + c.id + '\')" class="px-2 py-1 text-xs rounded-lg font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all" title="Delete Shop">🗑️</button>';
    h += '      </div>';
    h += '    </div>';
  }
  h += '  </div>';
  h += '</div>';

  if (appState.showModal) {
    var editingCust = appState.editingShopId ? appState.db.customers.find(function(c){ return c.id === appState.editingShopId; }) : null;

    h += '<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div class="glass p-6 rounded-2xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">';
    h += '    <h3 class="text-lg font-bold text-white">' + (editingCust ? 'Edit Shop Details' : 'Add New Shop') + '</h3>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Shop / Hotel Name</label><input id="shopName" type="text" value="' + (editingCust ? editingCust.name : '') + '" placeholder="e.g. Hotel Annapoorna" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold"></div>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">WhatsApp Phone Number (for Bills)</label><input id="shopPhone" type="text" value="' + (editingCust ? editingCust.ownerPhone : '') + '" placeholder="e.g. 9842100000" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-semibold"></div>';
    h += '    <div><label class="text-xs text-gray-400 font-bold block mb-1">Location / Address</label><input id="shopAddress" type="text" value="' + (editingCust && editingCust.address ? editingCust.address : '') + '" placeholder="e.g. Main Road, Bus Stand Junction" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm"></div>';
    h += '    <div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-gray-400 font-bold block mb-1">Unit Rate (₹)</label><input id="shopRate" type="number" value="' + (editingCust ? editingCust.unitRate : 7) + '" placeholder="7" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm font-bold"></div>';
    h += '      <div><label class="text-xs text-gray-400 font-bold block mb-1">Business Type</label><select id="shopType" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm">';
    var typeVal = editingCust ? editingCust.type : 'hotel';
    h += '          <option value="hotel" ' + (typeVal === 'hotel' ? 'selected' : '') + '>Hotel</option>';
    h += '          <option value="restaurant" ' + (typeVal === 'restaurant' ? 'selected' : '') + '>Restaurant</option>';
    h += '          <option value="catering" ' + (typeVal === 'catering' ? 'selected' : '') + '>Catering</option>';
    h += '          <option value="individual" ' + (typeVal === 'individual' ? 'selected' : '') + '>Individual</option>';
    h += '        </select></div></div>';
    h += '    <div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-gray-400 font-bold block mb-1">Default Morning Pcs</label><input id="shopMornQty" type="number" value="' + (editingCust ? editingCust.defaultMorningQty : 100) + '" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm"></div>';
    h += '      <div><label class="text-xs text-gray-400 font-bold block mb-1">Default Evening Pcs</label><input id="shopEveQty" type="number" value="' + (editingCust ? editingCust.defaultEveningQty : 50) + '" class="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm"></div></div>';
    h += '    <div class="flex justify-end gap-2 pt-3 border-t border-gray-800"><button onclick="window.closeShopModal()" class="px-4 py-2 bg-gray-800 text-xs rounded-xl text-gray-300">Cancel</button><button onclick="window.saveShopRecord()" class="px-4 py-2 bg-emerald-500 text-xs rounded-xl text-white font-bold">' + (editingCust ? 'Update Shop' : 'Save Shop') + '</button></div>';
    h += '  </div></div>';
  }

  return h;
}

export function openAddShopModal() { appState.editingShopId = null; appState.showModal = true; window.render(); }
export function openEditShopModal(id) { appState.editingShopId = id; appState.showModal = true; window.render(); }
export function closeShopModal() { appState.showModal = false; appState.editingShopId = null; window.render(); }

export function saveShopRecord() {
  var name = document.getElementById('shopName').value;
  var phone = document.getElementById('shopPhone').value;
  var address = document.getElementById('shopAddress').value;
  var rate = Number(document.getElementById('shopRate').value) || 7;
  var type = document.getElementById('shopType').value;
  var mornQty = Number(document.getElementById('shopMornQty').value) || 100;
  var eveQty = Number(document.getElementById('shopEveQty').value) || 50;

  if (!name) return alert("Please enter shop name.");

  if (appState.editingShopId) {
    var cust = appState.db.customers.find(function(c){ return c.id === appState.editingShopId; });
    if (cust) {
      cust.name = name;
      cust.ownerPhone = phone || '9842100000';
      cust.address = address;
      cust.unitRate = rate;
      cust.type = type;
      cust.defaultMorningQty = mornQty;
      cust.defaultEveningQty = eveQty;
    }
  } else {
    appState.db.customers.push({
      id: 'c' + Date.now(),
      name: name,
      type: type,
      ownerPhone: phone || '9842100000',
      address: address,
      unitRate: rate,
      defaultMorningQty: mornQty,
      defaultEveningQty: eveQty,
      isActive: true
    });
  }

  saveDB(appState.db);
  closeShopModal();
}

export function toggleShopStatus(id) {
  var cust = appState.db.customers.find(function(c){ return c.id === id; });
  if (cust) {
    cust.isActive = !cust.isActive;
    saveDB(appState.db);
    window.render();
  }
}

export function deleteShop(id) {
  var cust = appState.db.customers.find(function(c){ return c.id === id; });
  if (cust && confirm("Are you sure you want to delete '" + cust.name + "'? Orders and bill history for this shop will be preserved.")) {
    appState.db.customers = appState.db.customers.filter(function(c){ return c.id !== id; });
    saveDB(appState.db);
    window.render();
  }
}