const GRIDLESS = (function() {
  'use strict';
  const Utils = {
    generateNodeId: function() { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let id = ''; for (let i = 0; i < 3; i++) id += chars[Math.floor(Math.random() * chars.length)]; return 'NODE-' + id; },
    getMyNodeId: function() { let id = sessionStorage.getItem('gridless:myNodeId'); if (!id) { id = Utils.generateNodeId(); sessionStorage.setItem('gridless:myNodeId', id); } return id; },
    formatTime: function(date) { return date.toLocaleTimeString('en-US', { hour12: false }); },
    formatTimestamp: function(ts) { const d = new Date(ts); return d.toLocaleTimeString('en-US', { hour12: false }) + ' ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); },
    rand: function(min, max) { return Math.random() * (max - min) + min; },
    randInt: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    store: { get: function(k, f) { try { const v = localStorage.getItem('gridless:' + k); return v ? JSON.parse(v) : f; } catch(e) { return f; } }, set: function(k, v) { try { localStorage.setItem('gridless:' + k, JSON.stringify(v)); } catch(e) {} } },
    formatElapsed: function(seconds) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = seconds % 60; return [h,m,s].map(v => String(v).padStart(2,'0')).join(':'); },
    dist: function(x1, y1, x2, y2) { return Math.sqrt((x2-x1)**2 + (y2-y1)**2); }
  };
  const MY_NODE_ID = Utils.getMyNodeId();
  window.addEventListener('DOMContentLoaded', () => { const el = document.getElementById('header-node-id'); if (el) el.textContent = MY_NODE_ID; });
  return { utils: Utils, MY_NODE_ID: MY_NODE_ID };
})();
