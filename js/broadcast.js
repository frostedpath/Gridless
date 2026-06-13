GRIDLESS.broadcast = (function() {
  const Utils = GRIDLESS.utils;
  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;
  const Broadcast = {
    alerts: [],
    currentFilter: 'all',

    /** Pre-seeded realistic disaster alerts */
    seedAlerts: [
      {
        id: 'seed-1',
        severity: 'critical',
        source: 'NODE-K4R',
        message: 'FLASH FLOOD WARNING: Water levels rising rapidly in Sector 7. All ground-level shelters must evacuate immediately to elevated zones. Expected crest: 2.3m above normal.',
        coords: '28.6139°N, 77.2090°E',
        timestamp: Date.now() - 180000,
        verified: 7
      },
      {
        id: 'seed-2',
        severity: 'critical',
        message: 'STRUCTURAL COLLAPSE: Highway overpass at Grid Ref C4-North has partially collapsed. Route impassable. Rescue teams dispatched. Avoid area within 500m radius.',
        source: 'NODE-P8W',
        coords: '28.5921°N, 77.2341°E',
        timestamp: Date.now() - 420000,
        verified: 5
      },
      {
        id: 'seed-3',
        severity: 'warning',
        message: 'POWER GRID FAILURE: Main transformer station offline. Estimated restoration: 48-72 hours. Conserve battery power on all devices. Mesh relay nodes switching to low-power mode.',
        source: 'NODE-M2X',
        coords: '28.6280°N, 77.1987°E',
        timestamp: Date.now() - 900000,
        verified: 12
      },
      {
        id: 'seed-4',
        severity: 'warning',
        message: 'MEDICAL SUPPLY DROP: Emergency medical supplies arriving at Rally Point Bravo (Community Center, Block 12) in approximately 2 hours. Prioritize critical patients.',
        source: 'NODE-J5V',
        coords: '28.6350°N, 77.2150°E',
        timestamp: Date.now() - 1500000,
        verified: 9
      },
      {
        id: 'seed-5',
        severity: 'info',
        message: 'COMMUNICATION UPDATE: Mesh network coverage extended to Sectors 3-9. Signal strength nominal. New relay nodes deployed at elevated positions. All tabs are bridged.',
        source: 'NODE-A1B',
        coords: '28.6100°N, 77.2300°E',
        timestamp: Date.now() - 2400000,
        verified: 15
      }
    ],

    /** Initialize broadcast system */
    init: function() {
      // Load from storage or seed
      Broadcast.alerts = Utils.store.get('alerts', null);
      if (!Broadcast.alerts || Broadcast.alerts.length === 0) {
        Broadcast.alerts = Broadcast.seedAlerts.slice();
        Utils.store.set('alerts', Broadcast.alerts);
      }
      Broadcast.render();
    },

    /** Add a new alert */
    addAlert: function(alert) {
      alert.id = alert.id || 'alert-' + Date.now();
      alert.timestamp = alert.timestamp || Date.now();
      alert.verified = alert.verified || 1;
      Broadcast.alerts.unshift(alert);
      Utils.store.set('alerts', Broadcast.alerts);
      Broadcast.render();

      // Update dashboard last broadcast time
      Dashboard.updateLastBroadcast(alert.timestamp);
    },

    /** Render alerts to the broadcast feed */
    render: function() {
      const feed = document.getElementById('broadcast-feed');
      if (!feed) return;

      const filtered = Broadcast.currentFilter === 'all'
        ? Broadcast.alerts
        : Broadcast.alerts.filter(function(a) { return a.severity === Broadcast.currentFilter; });

      // Sort by priority then timestamp
      const priorityOrder = { critical: 0, warning: 1, info: 2 };
      filtered.sort(function(a, b) {
        const pDiff = priorityOrder[a.severity] - priorityOrder[b.severity];
        if (pDiff !== 0) return pDiff;
        return b.timestamp - a.timestamp;
      });

      feed.innerHTML = filtered.map(function(alert) {
        return '<div class="alert-card ' + alert.severity + ' fade-in">' +
          '<div class="alert-header">' +
            '<span class="severity-badge ' + alert.severity + '">' + alert.severity.toUpperCase() + '</span>' +
            '<span class="alert-source">SRC: ' + (alert.source || 'UNKNOWN') + '</span>' +
          '</div>' +
          '<div class="alert-message">' + alert.message + '</div>' +
          '<div class="alert-meta">' +
            '<span>📍 ' + (alert.coords || 'N/A') + '</span>' +
            '<span>🕐 ' + Utils.formatTimestamp(alert.timestamp) + '</span>' +
            '<span>✓ Verified by ' + alert.verified + ' nodes</span>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    /** Filter alerts by severity */
    filter: function(severity, btn) {
      Broadcast.currentFilter = severity;
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
      Broadcast.render();
    }
  };

  /* ===========================================================
     CHAT SYSTEM — BroadcastChannel P2P
     =========================================================== */
  
  window.addEventListener('DOMContentLoaded', Broadcast.init || function(){});
  return Broadcast;
})();
