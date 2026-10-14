import { appState } from '../store.js';

export function renderBackup() {
  var h = '<div class="glass p-5 rounded-2xl space-y-6">';
  h += '  <div><h2 class="text-lg font-bold text-white">Backup & Restore</h2><p class="text-xs text-gray-400">Export or restore your business records.</p></div>';
  h += '  <div class="glass-card p-4 rounded-xl space-y-2">';
  h += '    <h3 class="font-bold text-white text-sm">Download JSON Backup</h3>';
  h += '    <button onclick="window.exportData()" class="px-4 py-2 bg-emerald-500 font-bold text-white text-xs rounded-xl">📥 Export Backup (.json)</button>';
  h += '  </div>';
  h += '</div>';
  return h;
}

export function exportData() {
  var str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.db, null, 2));
  var a = document.createElement('a');
  a.setAttribute("href", str);
  a.setAttribute("download", "srisai-backup.json");
  document.body.appendChild(a);
  a.click();
  a.remove();
}