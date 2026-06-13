const fs = require('fs');
const path = require('path');

const srcFile = 'index.html';
const content = fs.readFileSync(srcFile, 'utf-8');

fs.mkdirSync('css', { recursive: true });
fs.mkdirSync('js', { recursive: true });
fs.mkdirSync('assets/icons', { recursive: true });

const cssMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) fs.writeFileSync('css/styles.css', cssMatch[1].trim() + '\n');

const icons = {
  'logo.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><line x1="2" y1="15.5" x2="22" y2="15.5"/></svg>',
  'nav-dash.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  'nav-mesh.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><line x1="5" y1="8" x2="5" y2="16"/><line x1="19" y1="8" x2="19" y2="16"/><line x1="7" y1="6" x2="17" y2="6"/><line x1="7" y1="18" x2="17" y2="18"/><line x1="7" y1="7" x2="17" y2="17"/></svg>',
  'nav-broadcast.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19.07 4.93A10 10 0 0 1 4.93 19.07"/><path d="M15.54 8.46A5 5 0 0 1 8.46 15.54"/><circle cx="12" cy="12" r="1.5"/></svg>',
  'nav-chat.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  'nav-sos.svg': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

for (const [name, svg] of Object.entries(icons)) {
  fs.writeFileSync(path.join('assets/icons', name), svg + '\n');
}

function buildHtml(pageId, contentHtml) {
  let finalContentHtml = contentHtml.replace(/onclick="GRIDLESS.router.navigate\('([^']+)'\)"/g, 'onclick="window.location.href=\'$1.html\'"');
  finalContentHtml = finalContentHtml.replace(/onclick="window.location.href='dashboard.html'"/g, 'onclick="window.location.href=\'index.html\'"');

  let activeClass = (id) => pageId === id ? "active" : "";
  
  let navHtml = '<nav id="bottom-nav">\n' +
'  <button class="nav-btn ' + activeClass('dashboard') + '" onclick="window.location.href=\'index.html\'">\n' +
'    ' + icons['nav-dash.svg'] + '\n' +
'    DASH\n' +
'  </button>\n' +
'  <button class="nav-btn ' + activeClass('mesh') + '" onclick="window.location.href=\'mesh.html\'">\n' +
'    ' + icons['nav-mesh.svg'] + '\n' +
'    MESH\n' +
'  </button>\n' +
'  <button class="nav-btn ' + activeClass('broadcast') + '" onclick="window.location.href=\'broadcast.html\'">\n' +
'    ' + icons['nav-broadcast.svg'] + '\n' +
'    ALERTS\n' +
'  </button>\n' +
'  <button class="nav-btn ' + activeClass('chat') + '" onclick="window.location.href=\'chat.html\'">\n' +
'    ' + icons['nav-chat.svg'] + '\n' +
'    CHAT\n' +
'  </button>\n' +
'  <button class="nav-btn sos-nav ' + activeClass('sos') + '" onclick="window.location.href=\'sos.html\'">\n' +
'    ' + icons['nav-sos.svg'] + '\n' +
'    SOS\n' +
'  </button>\n' +
'</nav>\n';

  let scriptTags = '<script src="js/core.js"></script>\n';
  if (pageId === 'mesh') scriptTags += '<script src="js/mesh-sim.js"></script>\n';
  if (pageId === 'broadcast') scriptTags += '<script src="js/broadcast.js"></script>\n';
  if (pageId === 'chat') scriptTags += '<script src="js/chat.js"></script>\n';
  if (pageId === 'sos') scriptTags += '<script src="js/sos.js"></script>\n';
  if (pageId === 'dashboard') {
    scriptTags += '<script src="js/mesh-sim.js"></script>\n';
    scriptTags += '<script src="js/dashboard.js"></script>\n';
  }

  let fullHtml = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<meta name="description" content="GRIDLESS — Offline-first emergency mesh communication platform for internet blackouts and natural disasters.">\n' +
'<title>GRIDLESS — Offline Emergency Mesh Network</title>\n' +
'<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">\n' +
'<link rel="stylesheet" href="css/styles.css">\n' +
'</head>\n' +
'<body>\n' +
'<header id="app-header">\n' +
'  <div class="logo" onclick="window.location.href=\'index.html\'">\n' +
'    ' + icons['logo.svg'] + '\n' +
'    <span class="logo-text">GRIDLESS</span>\n' +
'  </div>\n' +
'  <div class="status-pill">\n' +
'    <span class="status-dot"></span>\n' +
'    <span id="header-node-id">NODE-???</span>\n' +
'  </div>\n' +
'</header>\n' +
'<main id="view-container">\n' +
'  <section id="view-' + pageId + '" class="view active" style="display:block; opacity:1; transform:translateY(0)">\n' +
finalContentHtml + '\n' +
'  </section>\n' +
'</main>\n' +
navHtml +
scriptTags +
'</body>\n' +
'</html>';

  return fullHtml;
}

const views = {
  'dashboard': content.match(/<section id="view-dashboard" class="view">([\s\S]*?)<\/section>\s*<!-- ==================== MESH MAP ==================== -->/)[1],
  'mesh': content.match(/<section id="view-mesh" class="view">([\s\S]*?)<\/section>\s*<!-- ==================== BROADCAST BOARD ==================== -->/)[1],
  'broadcast': content.match(/<section id="view-broadcast" class="view">([\s\S]*?)<\/section>\s*<!-- ==================== CHAT ==================== -->/)[1],
  'chat': content.match(/<section id="view-chat" class="view">([\s\S]*?)<\/section>\s*<!-- ==================== SOS BEACON ==================== -->/)[1],
  'sos': content.match(/<section id="view-sos" class="view">([\s\S]*?)<\/section>\s*<\/main>/)[1]
};

fs.writeFileSync('index.html', buildHtml('dashboard', views['dashboard']));
fs.writeFileSync('mesh.html', buildHtml('mesh', views['mesh']));
fs.writeFileSync('broadcast.html', buildHtml('broadcast', views['broadcast']));
fs.writeFileSync('chat.html', buildHtml('chat', views['chat']));
fs.writeFileSync('sos.html', buildHtml('sos', views['sos']));

const coreJs = "const GRIDLESS = (function() {\n" +
"  'use strict';\n" +
"  const Utils = {\n" +
"    generateNodeId: function() { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let id = ''; for (let i = 0; i < 3; i++) id += chars[Math.floor(Math.random() * chars.length)]; return 'NODE-' + id; },\n" +
"    getMyNodeId: function() { let id = sessionStorage.getItem('gridless:myNodeId'); if (!id) { id = Utils.generateNodeId(); sessionStorage.setItem('gridless:myNodeId', id); } return id; },\n" +
"    formatTime: function(date) { return date.toLocaleTimeString('en-US', { hour12: false }); },\n" +
"    formatTimestamp: function(ts) { const d = new Date(ts); return d.toLocaleTimeString('en-US', { hour12: false }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); },\n" +
"    rand: function(min, max) { return Math.random() * (max - min) + min; },\n" +
"    randInt: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },\n" +
"    store: { get: function(k, f) { try { const v = localStorage.getItem('gridless:' + k); return v ? JSON.parse(v) : f; } catch(e) { return f; } }, set: function(k, v) { try { localStorage.setItem('gridless:' + k, JSON.stringify(v)); } catch(e) {} } },\n" +
"    formatElapsed: function(seconds) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60; return [h,m,s].map(v => String(v).padStart(2,'0')).join(':'); },\n" +
"    dist: function(x1, y1, x2, y2) { return Math.sqrt((x2-x1)**2 + (y2-y1)**2); }\n" +
"  };\n" +
"  const MY_NODE_ID = Utils.getMyNodeId();\n" +
"  window.addEventListener('DOMContentLoaded', () => { const el = document.getElementById('header-node-id'); if (el) el.textContent = MY_NODE_ID; });\n" +
"  return { utils: Utils, MY_NODE_ID: MY_NODE_ID };\n" +
"})();\n";
fs.writeFileSync('js/core.js', coreJs);

const jsContentMatch = content.match(/const MeshSim = {([\s\S]*?)const Broadcast = {/);
const broadcastContentMatch = content.match(/const Broadcast = {([\s\S]*?)const Chat = {/);
const chatContentMatch = content.match(/const Chat = {([\s\S]*?)const SOS = {/);
const sosContentMatch = content.match(/const SOS = {([\s\S]*?)const Dashboard = {/);
const dashboardContentMatch = content.match(/const Dashboard = {([\s\S]*?)function init\(\) {/);

const getMod = (match, modName) => "GRIDLESS." + modName.toLowerCase() + " = (function() {\n  const Utils = GRIDLESS.utils;\n  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;\n  const " + modName + " = {" + match[1] + "\n  window.addEventListener('DOMContentLoaded', " + modName + ".init || function(){});\n  return " + modName + ";\n})();\n";

const meshJs = "GRIDLESS.mesh = (function() {\n  const Utils = GRIDLESS.utils;\n  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;\n  const MeshSim = {" + jsContentMatch[1] + "\n" +
"  MeshSim.init = function() {\n" +
"    MeshSim.canvas = document.getElementById('mesh-canvas');\n" +
"    MeshSim.nodes = Utils.store.get('meshNodes', []);\n" +
"    if (MeshSim.nodes.length === 0) {\n" +
"      MeshSim.canvas = MeshSim.canvas || { width: 800, height: 600 };\n" +
"      MeshSim.generateNodes(10);\n" +
"    } else { if (MeshSim.nodes[0]) MeshSim.nodes[0].id = MY_NODE_ID; }\n" +
"    if (!document.getElementById('mesh-canvas')) {\n" +
"      setInterval(() => { MeshSim.churnNodes(); Utils.store.set('meshNodes', MeshSim.nodes); }, 4000);\n" +
"      return;\n" +
"    }\n" +
"    MeshSim.ctx = MeshSim.canvas.getContext('2d');\n" +
"    MeshSim.resize(); window.addEventListener('resize', MeshSim.resize);\n" +
"    MeshSim.canvas.addEventListener('click', MeshSim.onClick);\n" +
"    MeshSim.onViewEnter(); MeshSim.animate();\n" +
"    setInterval(() => { MeshSim.churnNodes(); Utils.store.set('meshNodes', MeshSim.nodes); }, 4000);\n" +
"  };\n" +
"  window.addEventListener('DOMContentLoaded', MeshSim.init);\n  return MeshSim;\n})();\n";

const broadcastJs = getMod(broadcastContentMatch, 'Broadcast');
const chatJs = getMod(chatContentMatch, 'Chat');
const sosJs = getMod(sosContentMatch, 'SOS');

const dashboardJs = "GRIDLESS.dashboard = (function() {\n  const Utils = GRIDLESS.utils;\n  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;\n  const MeshSim = GRIDLESS.mesh;\n  const Dashboard = {" + dashboardContentMatch[1] + "\n" +
"  Dashboard.updateStats = function() {\n" +
"    const countEl = document.getElementById('dash-nodes'); const sigEl = document.getElementById('dash-signal'); const pktEl = document.getElementById('dash-packets');\n" +
"    if (countEl && MeshSim) countEl.textContent = MeshSim.getActiveCount();\n" +
"    if (sigEl && MeshSim) sigEl.textContent = MeshSim.getAvgSignal() + '%';\n" +
"    if (pktEl) pktEl.textContent = Dashboard.packetsRelayed.toLocaleString();\n" +
"  };\n" +
"  if (!GRIDLESS.broadcast) { GRIDLESS.broadcast = { alerts: Utils.store.get('alerts', []), addAlert: function(a) { this.alerts.unshift(a); Utils.store.set('alerts', this.alerts); Dashboard.updateLastBroadcast(a.timestamp); } }; }\n" +
"  window.addEventListener('DOMContentLoaded', () => {\n" +
"    if (Dashboard.init) Dashboard.init();\n" +
"    const alerts = Utils.store.get('alerts', []);\n" +
"    if (alerts.length > 0) Dashboard.updateLastBroadcast(alerts[0].timestamp);\n" +
"  });\n" +
"  return Dashboard;\n})();\n";

fs.writeFileSync('js/mesh-sim.js', meshJs);
fs.writeFileSync('js/broadcast.js', broadcastJs);
fs.writeFileSync('js/chat.js', chatJs);
fs.writeFileSync('js/sos.js', sosJs);
fs.writeFileSync('js/dashboard.js', dashboardJs);
