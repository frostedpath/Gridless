GRIDLESS.mesh = (function() {
  const Utils = GRIDLESS.utils;
  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;
  const MeshSim = {
    canvas: null,
    ctx: null,
    nodes: [],
    connections: [],
    animFrame: null,
    selectedNode: null,
    connectionRange: 200,

    /** Initialize mesh network with 10 random nodes */
    init: function() {
      MeshSim.canvas = document.getElementById('mesh-canvas');
      if (!MeshSim.canvas) return;
      MeshSim.ctx = MeshSim.canvas.getContext('2d');
      MeshSim.resize();
      window.addEventListener('resize', MeshSim.resize);
      MeshSim.canvas.addEventListener('click', MeshSim.onClick);

      // Generate initial nodes
      MeshSim.generateNodes(10);

      // Start simulation loop
      MeshSim.animate();

      // Node churn every 4 seconds
      setInterval(MeshSim.churnNodes, 4000);
    },

    /** Generate N mesh nodes with random properties */
    generateNodes: function(count) {
      const w = MeshSim.canvas.width;
      const h = MeshSim.canvas.height;
      const padding = 50;

      for (let i = 0; i < count; i++) {
        const isUserNode = (i === 0);
        MeshSim.nodes.push({
          id: isUserNode ? MY_NODE_ID : Utils.generateNodeId(),
          x: Utils.rand(padding, w - padding),
          y: Utils.rand(padding, h - padding),
          targetX: 0,
          targetY: 0,
          radius: isUserNode ? 8 : 6,
          signal: Utils.randInt(40, 100),
          battery: Utils.randInt(15, 100),
          active: true,
          sos: false,
          isUser: isUserNode,
          lastSeen: Date.now() - Utils.randInt(0, 60000),
          relayed: Utils.randInt(5, 200),
          pulsePhase: Math.random() * Math.PI * 2,
          driftSpeed: Utils.rand(0.1, 0.5),
          driftAngle: Math.random() * Math.PI * 2,
          lat: Utils.rand(28.5, 28.7).toFixed(4),
          lng: Utils.rand(77.1, 77.3).toFixed(4)
        });
      }

      // Set drift targets
      MeshSim.nodes.forEach(function(n) {
        n.targetX = n.x + Math.cos(n.driftAngle) * 30;
        n.targetY = n.y + Math.sin(n.driftAngle) * 30;
      });
    },

    /** Resize canvas to container */
    resize: function() {
      const container = MeshSim.canvas.parentElement;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      MeshSim.canvas.width = rect.width * dpr;
      MeshSim.canvas.height = rect.height * dpr;
      MeshSim.canvas.style.width = rect.width + 'px';
      MeshSim.canvas.style.height = rect.height + 'px';
      MeshSim.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      MeshSim.connectionRange = Math.min(rect.width, rect.height) * 0.45;
    },

    /** Random node churn: drop/reconnect 1-2 nodes */
    churnNodes: function() {
      const count = Utils.randInt(1, 2);
      for (let i = 0; i < count; i++) {
        const idx = Utils.randInt(1, MeshSim.nodes.length - 1); // Skip user node
        const node = MeshSim.nodes[idx];
        if (!node) continue;

        if (node.active && Math.random() > 0.4) {
          // Drop node
          node.active = false;
          node.signal = Utils.randInt(0, 10);
        } else if (!node.active) {
          // Reconnect node
          node.active = true;
          node.signal = Utils.randInt(30, 100);
          node.lastSeen = Date.now();
          node.battery = Math.max(5, node.battery - Utils.randInt(1, 5));
        }

        // Randomly adjust signal strength
        if (node.active) {
          node.signal = Math.max(10, Math.min(100, node.signal + Utils.randInt(-15, 15)));
          node.battery = Math.max(3, node.battery - Utils.randInt(0, 2));
          node.relayed += Utils.randInt(0, 3);
          node.lastSeen = Date.now();
        }
      }

      // Drift nodes slightly
      MeshSim.nodes.forEach(function(n) {
        if (!n.active) return;
        n.driftAngle += Utils.rand(-0.3, 0.3);
        const w = MeshSim.canvas.width / (window.devicePixelRatio || 1);
        const h = MeshSim.canvas.height / (window.devicePixelRatio || 1);
        n.targetX = Math.max(30, Math.min(w - 30, n.x + Math.cos(n.driftAngle) * 20));
        n.targetY = Math.max(30, Math.min(h - 30, n.y + Math.sin(n.driftAngle) * 20));
      });

      // Update dashboard counters
      Dashboard.updateStats();
    },

    /** Calculate connections based on distance and signal */
    calcConnections: function() {
      MeshSim.connections = [];
      const activeNodes = MeshSim.nodes.filter(function(n) { return n.active; });
      for (let i = 0; i < activeNodes.length; i++) {
        for (let j = i + 1; j < activeNodes.length; j++) {
          const d = Utils.dist(activeNodes[i].x, activeNodes[i].y, activeNodes[j].x, activeNodes[j].y);
          if (d < MeshSim.connectionRange) {
            const strength = 1 - (d / MeshSim.connectionRange);
            MeshSim.connections.push({
              a: activeNodes[i],
              b: activeNodes[j],
              strength: strength,
              distance: d
            });
          }
        }
      }
    },

    /** Main animation loop */
    animate: function() {
      const ctx = MeshSim.ctx;
      if (!ctx) return;
      const w = MeshSim.canvas.width / (window.devicePixelRatio || 1);
      const h = MeshSim.canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      // Draw grid pattern
      ctx.strokeStyle = 'rgba(0,255,136,0.03)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Move nodes toward targets
      MeshSim.nodes.forEach(function(n) {
        n.x += (n.targetX - n.x) * 0.02;
        n.y += (n.targetY - n.y) * 0.02;
        n.pulsePhase += 0.03;
      });

      // Calculate connections
      MeshSim.calcConnections();

      // Draw connections
      const time = Date.now() * 0.001;
      MeshSim.connections.forEach(function(conn) {
        ctx.beginPath();
        ctx.moveTo(conn.a.x, conn.a.y);
        ctx.lineTo(conn.b.x, conn.b.y);

        const alpha = conn.strength * 0.4;
        if (conn.a.sos || conn.b.sos) {
          ctx.strokeStyle = 'rgba(255,45,85,' + alpha + ')';
        } else {
          ctx.strokeStyle = 'rgba(0,255,136,' + alpha + ')';
        }
        ctx.lineWidth = conn.strength * 2;
        ctx.stroke();

        // Animated data packet traveling along connection
        if (conn.strength > 0.3 && Math.random() > 0.97) {
          const t = (time * 0.5) % 1;
          const px = conn.a.x + (conn.b.x - conn.a.x) * t;
          const py = conn.a.y + (conn.b.y - conn.a.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,255,136,0.8)';
          ctx.fill();
        }
      });

      // Draw nodes
      MeshSim.nodes.forEach(function(node) {
        const pulse = Math.sin(node.pulsePhase) * 0.3 + 0.7;

        if (node.active) {
          // Glow effect
          const glowSize = node.radius * 3 * pulse;
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);

          if (node.sos) {
            gradient.addColorStop(0, 'rgba(255,45,85,0.4)');
            gradient.addColorStop(1, 'rgba(255,45,85,0)');
          } else if (node.signal < 30) {
            gradient.addColorStop(0, 'rgba(255,184,0,0.3)');
            gradient.addColorStop(1, 'rgba(255,184,0,0)');
          } else {
            gradient.addColorStop(0, 'rgba(0,255,136,0.3)');
            gradient.addColorStop(1, 'rgba(0,255,136,0)');
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          if (node.sos) {
            ctx.fillStyle = '#FF2D55';
            ctx.shadowColor = '#FF2D55';
          } else if (node.isUser) {
            ctx.fillStyle = '#00FF88';
            ctx.shadowColor = '#00FF88';
          } else if (node.signal < 30) {
            ctx.fillStyle = '#FFB800';
            ctx.shadowColor = '#FFB800';
          } else {
            ctx.fillStyle = '#00FF88';
            ctx.shadowColor = '#00FF88';
          }
          ctx.shadowBlur = 10 * pulse;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Node label
          ctx.fillStyle = 'rgba(224,224,224,0.7)';
          ctx.font = '9px "Share Tech Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.id, node.x, node.y - node.radius - 8);

          // Signal percentage
          ctx.fillStyle = 'rgba(0,255,136,0.5)';
          ctx.font = '8px "Share Tech Mono", monospace';
          ctx.fillText(node.signal + '%', node.x, node.y + node.radius + 14);
        } else {
          // Offline node (dimmed)
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,45,85,0.3)';
          ctx.fill();

          ctx.strokeStyle = 'rgba(255,45,85,0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = 'rgba(224,224,224,0.3)';
          ctx.font = '8px "Share Tech Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.id, node.x, node.y - node.radius - 6);
        }
      });

      // Draw selection ring around selected node
      if (MeshSim.selectedNode) {
        const sn = MeshSim.selectedNode;
        ctx.beginPath();
        ctx.arc(sn.x, sn.y, sn.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,255,136,0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      MeshSim.animFrame = requestAnimationFrame(MeshSim.animate);
    },

    /** Handle canvas click to select a node */
    onClick: function(e) {
      const rect = MeshSim.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let hit = null;
      let minDist = 20;
      MeshSim.nodes.forEach(function(node) {
        const d = Utils.dist(x, y, node.x, node.y);
        if (d < minDist) {
          minDist = d;
          hit = node;
        }
      });

      if (hit) {
        MeshSim.selectedNode = hit;
        MeshSim.showNodeInfo(hit);
      } else {
        MeshSim.closePanel();
      }
    },

    /** Show node information panel */
    showNodeInfo: function(node) {
      document.getElementById('panel-node-id').textContent = node.id;
      document.getElementById('panel-status').textContent = node.active ? 'ONLINE' : 'OFFLINE';
      document.getElementById('panel-status').style.color = node.active ? 'var(--accent)' : 'var(--alert-red)';
      document.getElementById('panel-battery').textContent = node.battery + '%';
      document.getElementById('panel-signal').textContent = node.signal + '%';
      document.getElementById('panel-lastseen').textContent = Utils.formatTimestamp(node.lastSeen);
      document.getElementById('panel-relayed').textContent = node.relayed;
      document.getElementById('panel-coords').textContent = node.lat + '°N, ' + node.lng + '°E';

      const bar = document.getElementById('panel-battery-bar');
      bar.style.width = node.battery + '%';
      bar.style.background = node.battery > 30 ? 'var(--accent)' : node.battery > 15 ? 'var(--warning-amber)' : 'var(--alert-red)';

      document.getElementById('node-info-panel').classList.add('visible');
    },

    /** Close node info panel */
    closePanel: function() {
      document.getElementById('node-info-panel').classList.remove('visible');
      MeshSim.selectedNode = null;
    },

    /** Called when mesh view becomes active */
    onViewEnter: function() {
      const oldW = MeshSim.canvas.width;
      MeshSim.resize();
      const newW = MeshSim.canvas.width;
      
      // If canvas was previously 0 width (hidden), distribute nodes now
      if (oldW === 0 && newW > 0 && MeshSim.nodes.length > 0) {
        const w = newW / (window.devicePixelRatio || 1);
        const h = MeshSim.canvas.height / (window.devicePixelRatio || 1);
        const padding = 50;
        MeshSim.nodes.forEach(function(n) {
          n.x = Utils.rand(padding, Math.max(padding + 1, w - padding));
          n.y = Utils.rand(padding, Math.max(padding + 1, h - padding));
          n.targetX = n.x + Math.cos(n.driftAngle) * 30;
          n.targetY = n.y + Math.sin(n.driftAngle) * 30;
        });
      }
    },

    /** Set the user node SOS state */
    setUserSOS: function(active) {
      if (MeshSim.nodes.length > 0) {
        MeshSim.nodes[0].sos = active;
      }
    },

    /** Get active node count */
    getActiveCount: function() {
      return MeshSim.nodes.filter(function(n) { return n.active; }).length;
    },

    /** Get average signal strength */
    getAvgSignal: function() {
      const active = MeshSim.nodes.filter(function(n) { return n.active; });
      if (active.length === 0) return 0;
      const total = active.reduce(function(sum, n) { return sum + n.signal; }, 0);
      return Math.round(total / active.length);
    }
  };

  /* ===========================================================
     BROADCAST SYSTEM
     =========================================================== */
  
  MeshSim.init = function() {
    MeshSim.canvas = document.getElementById('mesh-canvas');
    MeshSim.nodes = Utils.store.get('meshNodes', []);
    if (MeshSim.nodes.length === 0) {
      MeshSim.canvas = MeshSim.canvas || { width: 800, height: 600 };
      MeshSim.generateNodes(10);
    } else { if (MeshSim.nodes[0]) MeshSim.nodes[0].id = MY_NODE_ID; }
    if (!document.getElementById('mesh-canvas')) {
      setInterval(() => { MeshSim.churnNodes(); Utils.store.set('meshNodes', MeshSim.nodes); }, 4000);
      return;
    }
    MeshSim.ctx = MeshSim.canvas.getContext('2d');
    MeshSim.resize(); window.addEventListener('resize', MeshSim.resize);
    MeshSim.canvas.addEventListener('click', MeshSim.onClick);
    MeshSim.onViewEnter(); MeshSim.animate();
    setInterval(() => { MeshSim.churnNodes(); Utils.store.set('meshNodes', MeshSim.nodes); }, 4000);
  };
  window.addEventListener('DOMContentLoaded', MeshSim.init);
  return MeshSim;
})();
