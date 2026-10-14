import { appState, formatMoney } from '../store.js';

export function renderDashboard() {
  var orders = appState.db.orders.filter(function(o){ return o.deliveryStatus === 'delivered'; });

  if (appState.dashShop !== 'all') {
    orders = orders.filter(function(o){ return o.customerId === appState.dashShop; });
  }

  var todayStr = '2026-10-14';
  if (appState.dashDateMode === 'today') {
    orders = orders.filter(function(o){ return o.date === todayStr; });
  } else if (appState.dashDateMode === 'thisWeek') {
    orders = orders.filter(function(o){ return o.date >= '2026-10-12' && o.date <= '2026-10-18'; });
  } else if (appState.dashDateMode === 'thisMonth') {
    orders = orders.filter(function(o){ return o.date >= '2026-10-01' && o.date <= '2026-10-31'; });
  } else if (appState.dashDateMode === 'custom' && appState.dashStartDate && appState.dashEndDate) {
    orders = orders.filter(function(o){ return o.date >= appState.dashStartDate && o.date <= appState.dashEndDate; });
  }

  var rev = orders.reduce(function(s, o){ return s + o.amount; }, 0);
  var pcs = orders.reduce(function(s, o){ return s + o.pieces; }, 0);
  var paid = appState.db.payments.reduce(function(s, p){ return s + p.amount; }, 0);
  var totalDelivered = appState.db.orders.filter(function(o){ return o.deliveryStatus === 'delivered'; }).reduce(function(s, o){ return s + o.amount; }, 0);
  var dues = totalDelivered - paid;

  var shopRevenueMap = {};
  var colors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1'];
  for (var i = 0; i < orders.length; i++) {
    var ord = orders[i];
    shopRevenueMap[ord.customerId] = (shopRevenueMap[ord.customerId] || 0) + ord.amount;
  }

  var dateMap = {};
  for (var d = 0; d < orders.length; d++) {
    var oDate = orders[d].date;
    dateMap[oDate] = (dateMap[oDate] || 0) + orders[d].amount;
  }
  var sortedDates = Object.keys(dateMap).sort();
  var maxDailyRev = Math.max.apply(Math, Object.values(dateMap).concat([1000]));

  var h = '';

  // Filter Bar
  h += '<div class="glass p-4 rounded-2xl mb-6 space-y-4">';
  h += '  <div class="flex flex-wrap items-center justify-between gap-4">';
  h += '    <div class="flex items-center gap-2">';
  h += '      <label class="text-xs text-gray-400 font-bold">Filter Shop:</label>';
  h += '      <select onchange="window.setDashShop(this.value)" class="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-2 font-semibold">';
  h += '        <option value="all">All Shops</option>';
  for (var j = 0; j < appState.db.customers.length; j++) {
    var c = appState.db.customers[j];
    h += '        <option value="' + c.id + '" ' + (appState.dashShop === c.id ? 'selected' : '') + '>' + c.name + '</option>';
  }
  h += '      </select>';
  h += '    </div>';

  h += '    <div class="flex items-center gap-2 flex-wrap">';
  h += '      <label class="text-xs text-gray-400 font-bold">Date Range:</label>';
  h += '      <select onchange="window.setDashDateMode(this.value)" class="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-2 font-semibold">';
  h += '        <option value="all" ' + (appState.dashDateMode === 'all' ? 'selected' : '') + '>All Time</option>';
  h += '        <option value="today" ' + (appState.dashDateMode === 'today' ? 'selected' : '') + '>Today</option>';
  h += '        <option value="thisWeek" ' + (appState.dashDateMode === 'thisWeek' ? 'selected' : '') + '>This Week</option>';
  h += '        <option value="thisMonth" ' + (appState.dashDateMode === 'thisMonth' ? 'selected' : '') + '>This Month</option>';
  h += '        <option value="custom" ' + (appState.dashDateMode === 'custom' ? 'selected' : '') + '>Custom Range</option>';
  h += '      </select>';
  h += '    </div>';
  h += '  </div>';

  if (appState.dashDateMode === 'custom') {
    h += '  <div class="flex items-center gap-3 pt-2 border-t border-gray-800">';
    h += '    <span class="text-xs text-gray-400 font-semibold">From:</span>';
    h += '    <input type="date" value="' + appState.dashStartDate + '" onchange="window.setDashStartDate(this.value)" class="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-1.5 font-semibold">';
    h += '    <span class="text-xs text-gray-400 font-semibold">To:</span>';
    h += '    <input type="date" value="' + appState.dashEndDate + '" onchange="window.setDashEndDate(this.value)" class="bg-gray-900 border border-gray-700 text-white text-xs rounded-xl px-3 py-1.5 font-semibold">';
    h += '  </div>';
  }
  h += '</div>';

  // KPI Row
  h += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">';
  h += '  <div class="glass-card p-4 rounded-2xl border-l-4 border-emerald-500"><p class="text-xs text-gray-400 font-bold">PIECES SUPPLIED</p><p class="text-2xl font-bold text-white mt-1 secret-number">' + pcs.toLocaleString('en-IN') + '</p></div>';
  h += '  <div class="glass-card p-4 rounded-2xl border-l-4 border-teal-500"><p class="text-xs text-gray-400 font-bold">FILTERED REVENUE</p><p class="text-2xl font-bold text-emerald-400 mt-1 secret-number">' + formatMoney(rev) + '</p></div>';
  h += '  <div class="glass-card p-4 rounded-2xl border-l-4 border-rose-500"><p class="text-xs text-gray-400 font-bold">TOTAL DUES OWED</p><p class="text-2xl font-bold text-rose-400 mt-1 secret-number">' + formatMoney(dues) + '</p></div>';
  h += '  <div class="glass-card p-4 rounded-2xl border-l-4 border-sky-500"><p class="text-xs text-gray-400 font-bold">COLLECTED CASH</p><p class="text-2xl font-bold text-sky-400 mt-1 secret-number">' + formatMoney(paid) + '</p></div>';
  h += '</div>';

  // Pie Chart
  h += '<div class="glass p-5 rounded-2xl mb-6">';
  h += '  <h2 class="text-md font-bold text-white mb-4">Shop Revenue Share (Pie Breakdown)</h2>';
  var shopKeys = Object.keys(shopRevenueMap);
  if (shopKeys.length === 0) {
    h += '  <p class="text-xs text-gray-500 text-center py-6">No sales data found for the selected filters.</p>';
  } else {
    var svgArcs = '';
    var cumulativeAngle = 0;
    var colorIdx = 0;

    for (var k = 0; k < shopKeys.length; k++) {
      var cid = shopKeys[k];
      var val = shopRevenueMap[cid];
      var percentage = rev > 0 ? (val / rev) : 0;
      var angle = percentage * 360;

      var x1 = 50 + 40 * Math.cos(Math.PI * (cumulativeAngle - 90) / 180);
      var y1 = 50 + 40 * Math.sin(Math.PI * (cumulativeAngle - 90) / 180);
      cumulativeAngle += angle;
      var x2 = 50 + 40 * Math.cos(Math.PI * (cumulativeAngle - 90) / 180);
      var y2 = 50 + 40 * Math.sin(Math.PI * (cumulativeAngle - 90) / 180);

      var largeArcFlag = angle > 180 ? 1 : 0;
      var color = colors[colorIdx % colors.length];
      colorIdx++;

      if (shopKeys.length === 1) {
        svgArcs += '<circle cx="50" cy="50" r="40" fill="' + color + '" />';
      } else {
        svgArcs += '<path d="M 50 50 L ' + x1 + ' ' + y1 + ' A 40 40 0 ' + largeArcFlag + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + color + '" />';
      }
    }

    h += '  <div class="flex flex-col md:flex-row items-center justify-around gap-6">';
    h += '    <div class="w-44 h-44 relative flex items-center justify-center shrink-0">';
    h += '      <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90 rounded-full overflow-hidden">' + svgArcs + '</svg>';
    h += '    </div>';
    h += '    <div class="space-y-2.5 w-full flex-1 max-w-md">';
    colorIdx = 0;
    for (var l = 0; l < shopKeys.length; l++) {
      var custId = shopKeys[l];
      var custObj = appState.db.customers.find(function(c){ return c.id === custId; }) || { name: 'Unknown' };
      var shopVal = shopRevenueMap[custId];
      var pctVal = Math.round((shopVal / rev) * 100);
      var clr = colors[colorIdx % colors.length];
      colorIdx++;

      h += '      <div class="flex justify-between items-center glass-card p-2.5 rounded-xl text-xs">';
      h += '        <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full shrink-0" style="background-color: ' + clr + '"></span><span class="text-white font-semibold">' + custObj.name + '</span></div>';
      h += '        <span class="text-emerald-400 font-bold secret-number">' + formatMoney(shopVal) + ' (' + pctVal + '%)</span>';
      h += '      </div>';
    }
    h += '    </div>';
    h += '  </div>';
  }
  h += '</div>';

  // Revenue Monitor Bar Chart
  h += '<div class="glass p-5 rounded-2xl">';
  h += '  <div class="flex justify-between items-center mb-4"><h2 class="text-md font-bold text-white">Revenue Monitor (Daily Sales)</h2><span class="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">Delivered Orders</span></div>';
  if (sortedDates.length === 0) {
    h += '  <p class="text-xs text-gray-500 text-center py-6">No delivered orders for the selected range.</p>';
  } else {
    h += '  <div class="h-44 w-full flex items-end gap-3 pt-6 pb-2 border-b border-gray-800 overflow-x-auto">';
    for (var dt = 0; dt < sortedDates.length; dt++) {
      var dateKey = sortedDates[dt];
      var dayRevenue = dateMap[dateKey];
      var barHeightPct = Math.max(Math.round((dayRevenue / maxDailyRev) * 100), 12);

      h += '    <div class="flex-1 min-w-[48px] flex flex-col items-center gap-1.5 group">';
      h += '      <span class="text-[10px] text-emerald-400 font-bold secret-number opacity-80 group-hover:opacity-100 transition-opacity">₹' + dayRevenue + '</span>';
      h += '      <div class="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded-t-lg transition-all" style="height: ' + barHeightPct + '%"></div>';
      h += '      <span class="text-[10px] text-gray-400 font-semibold">' + dateKey.slice(5) + '</span>';
      h += '    </div>';
    }
    h += '  </div>';
  }
  h += '</div>';

  return h;
}