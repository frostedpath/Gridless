GRIDLESS.dashboard = (function() {
  const Utils = GRIDLESS.utils;
  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;
  const MeshSim = GRIDLESS.mesh;
  const Dashboard = {
    startTime: Date.now(),
    packetsRelayed: Utils.store.get('packetsRelayed', 0) || 142,
    waveCanvas: null,
    waveCtx: null,
    wavePhase: 0,

    /** Initialize dashboard */
    init: function() {
      Dashboard.waveCanvas = document.getElementById('waveform-canvas');
      if (Dashboard.waveCanvas) {
        Dashboard.waveCtx = Dashboard.waveCanvas.getContext('2d');
        Dashboard.resizeWave();
        window.addEventListener('resize', Dashboard.resizeWave);
      }

      // Start uptime counter
      setInterval(function() {
        const elapsed = Math.floor((Date.now() - Dashboard.startTime) / 1000);
        document.getElementById('dash-uptime').textContent = Utils.formatElapsed(elapsed);
      }, 1000);

      // Increment packets every few seconds
      setInterval(function() {
        Dashboard.packetsRelayed += Utils.randInt(1, 5);
        Utils.store.set('packetsRelayed', Dashboard.packetsRelayed);
        Dashboard.updateStats();
      }, 3000);

      // Animate waveform
      Dashboard.animateWave();

      Dashboard.updateStats();
    },

    /** Resize waveform canvas */
    resizeWave: function() {
      if (!Dashboard.waveCanvas) return;
      const container = Dashboard.waveCanvas.parentElement;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      Dashboard.waveCanvas.width = rect.width * dpr;
      Dashboard.waveCanvas.height = rect.height * dpr;
      Dashboard.waveCanvas.style.width = rect.width + 'px';
      Dashboard.waveCanvas.style.height = rect.height + 'px';
      Dashboard.waveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    /** Update dashboard statistics */
    updateStats: function() {
      document.getElementById('dash-nodes').textContent = MeshSim.getActiveCount();
      document.getElementById('dash-signal').textContent = MeshSim.getAvgSignal() + '%';
      document.getElementById('dash-packets').textContent = Dashboard.packetsRelayed.toLocaleString();
    },

    /** Update last broadcast timestamp */
    updateLastBroadcast: function(ts) {
      document.getElementById('dash-last-broadcast').textContent = 'Last broadcast: ' + Utils.formatTimestamp(ts);
    },

    /** Animate the signal waveform */
    animateWave: function() {
      const ctx = Dashboard.waveCtx;
      if (!ctx) { requestAnimationFrame(Dashboard.animateWave); return; }

      const w = Dashboard.waveCanvas.width / (window.devicePixelRatio || 1);
      const h = Dashboard.waveCanvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      Dashboard.wavePhase += 0.04;

      // Draw multiple wave layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const amp = (h * 0.25) * (1 - layer * 0.25);
        const freq = 0.02 + layer * 0.01;
        const alpha = 0.4 - layer * 0.1;
        const phaseOffset = layer * 1.2;

        for (let x = 0; x <= w; x++) {
          const y = h / 2 + Math.sin(x * freq + Dashboard.wavePhase + phaseOffset) * amp
                    + Math.sin(x * freq * 2.3 + Dashboard.wavePhase * 1.5) * amp * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = 'rgba(0,255,136,' + alpha + ')';
        ctx.lineWidth = 1.5 - layer * 0.3;
        ctx.stroke();
      }

      // Add glow line at center
      const gradient = ctx.createLinearGradient(0, h/2 - 1, 0, h/2 + 1);
      gradient.addColorStop(0, 'rgba(0,255,136,0)');
      gradient.addColorStop(0.5, 'rgba(0,255,136,0.05)');
      gradient.addColorStop(1, 'rgba(0,255,136,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(Dashboard.animateWave);
    }
  };

  /* ===========================================================
     INITIALIZATION
     =========================================================== */
  
  Dashboard.updateStats = function() {
    const countEl = document.getElementById('dash-nodes'); const sigEl = document.getElementById('dash-signal'); const pktEl = document.getElementById('dash-packets');
    if (countEl && MeshSim) countEl.textContent = MeshSim.getActiveCount();
    if (sigEl && MeshSim) sigEl.textContent = MeshSim.getAvgSignal() + '%';
    if (pktEl) pktEl.textContent = Dashboard.packetsRelayed.toLocaleString();
  };
  if (!GRIDLESS.broadcast) { GRIDLESS.broadcast = { alerts: Utils.store.get('alerts', []), addAlert: function(a) { this.alerts.unshift(a); Utils.store.set('alerts', this.alerts); Dashboard.updateLastBroadcast(a.timestamp); } }; }
  window.addEventListener('DOMContentLoaded', () => {
    if (Dashboard.init) Dashboard.init();
    const alerts = Utils.store.get('alerts', []);
    if (alerts.length > 0) Dashboard.updateLastBroadcast(alerts[0].timestamp);
  });
  return Dashboard;
})();
