import { appState, saveDB } from './store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderOrders, recalculateOrderTotals, saveOrdersBatch } from './views/orders.js';
import { renderChecklist, toggleDeliveryStatus } from './views/checklist.js';
import { renderCollections, openRecordPaymentModal, closeRecordPaymentModal, savePaymentRecord } from './views/collections.js';
import { renderExpenses, toggleExpenseModal, setExpenseFilterCategory, saveNewExpense, deleteExpense } from './views/expenses.js';
import { renderBills, setBillShop, setBillRangeMode, setBillStartDate, setBillEndDate, sendWhatsAppDetailedBill, downloadBillCardPNG } from './views/bills.js';
import { renderShops, openAddShopModal, openEditShopModal, closeShopModal, saveShopRecord, toggleShopStatus, deleteShop } from './views/shops.js';
import { renderBackup, exportData } from './views/backup.js';

// Bind global handlers for HTML inline events
window.appState = appState;
window.saveOrdersBatch = saveOrdersBatch;
window.recalculateOrderTotals = recalculateOrderTotals;
window.toggleDeliveryStatus = toggleDeliveryStatus;
window.openRecordPaymentModal = openRecordPaymentModal;
window.closeRecordPaymentModal = closeRecordPaymentModal;
window.savePaymentRecord = savePaymentRecord;
window.toggleExpenseModal = toggleExpenseModal;
window.setExpenseFilterCategory = setExpenseFilterCategory;
window.saveNewExpense = saveNewExpense;
window.deleteExpense = deleteExpense;
window.setBillShop = setBillShop;
window.setBillRangeMode = setBillRangeMode;
window.setBillStartDate = setBillStartDate;
window.setBillEndDate = setBillEndDate;
window.sendWhatsAppDetailedBill = sendWhatsAppDetailedBill;
window.downloadBillCardPNG = downloadBillCardPNG;
window.openAddShopModal = openAddShopModal;
window.openEditShopModal = openEditShopModal;
window.closeShopModal = closeShopModal;
window.saveShopRecord = saveShopRecord;
window.toggleShopStatus = toggleShopStatus;
window.deleteShop = deleteShop;
window.exportData = exportData;

window.switchTab = function(t) {
  appState.tab = t;
  window.render();
};

window.togglePrivacy = function() {
  appState.db.settings.hideConfidential = !appState.db.settings.hideConfidential;
  saveDB(appState.db);
  window.render();
};

window.render = function() {
  var container = document.getElementById('app');
  if (!container) return;

  container.className = appState.db.settings.hideConfidential ? 'hide-numbers' : '';

  var html = '';

  // Header
  html += '<header class="glass rounded-2xl p-4 mb-6 flex justify-between items-center flex-wrap gap-4">';
  html += '  <div class="flex items-center gap-3">';
  html += '    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">SS</div>';
  html += '    <div><h1 class="text-xl font-bold text-white">' + appState.db.settings.businessName + '</h1><p class="text-xs text-gray-400">Idiyappam Supply & Revenue Hub</p></div>';
  html += '  </div>';
  html += '  <div class="flex gap-2">';
  html += '    <button onclick="window.togglePrivacy()" class="px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300 border border-gray-700">' + (appState.db.settings.hideConfidential ? '🙈 Numbers Hidden' : '👁️ Numbers Visible') + '</button>';
  html += '  </div>';
  html += '</header>';

  // Nav Tabs
  var tabs = ['dashboard', 'orders', 'checklist', 'collections', 'expenses', 'bills', 'shops', 'backup'];
  html += '<nav class="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-none">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var active = appState.tab === t;
    html += '<button onclick="window.switchTab(\'' + t + '\')" class="px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ' + (active ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-800/60 text-gray-400') + '">' + t.toUpperCase() + '</button>';
  }
  html += '</nav>';

  // Router
  html += '<main>';
  if (appState.tab === 'dashboard') html += renderDashboard();
  if (appState.tab === 'orders') html += renderOrders();
  if (appState.tab === 'checklist') html += renderChecklist();
  if (appState.tab === 'collections') html += renderCollections();
  if (appState.tab === 'expenses') html += renderExpenses();
  if (appState.tab === 'bills') html += renderBills();
  if (appState.tab === 'shops') html += renderShops();
  if (appState.tab === 'backup') html += renderBackup();
  html += '</main>';

  container.innerHTML = html;

  if (appState.tab === 'orders') {
    recalculateOrderTotals();
  }
};

// Initial Render
window.render();