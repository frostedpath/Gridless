GRIDLESS.sos = (function() {
  const Utils = GRIDLESS.utils;
  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;
  const SOS_DURATION_SECONDS = 300;

  const SOS = {
    active: false,
    timer: null,
    beepTimer: null,
    audioCtx: null,
    coords: null,
    zeroAlarmPlayed: false,

    /** Initialize SOS system */
    init: function() {
      SOS.updateCoords();

      const wasActive = Utils.store.get('sosActive', false);
      if (wasActive) {
        SOS.activate(true);
      }
    },

    /** Get GPS coordinates */
    updateCoords: function() {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              SOS.coords = {
                lat: pos.coords.latitude.toFixed(4),
                lng: pos.coords.longitude.toFixed(4)
              };
              SOS.displayCoords();
            },
            function() {
              SOS.coords = { lat: '28.6139', lng: '77.2090' };
              SOS.displayCoords();
            },
            { timeout: 5000 }
          );
        } else {
          SOS.coords = { lat: '28.6139', lng: '77.2090' };
          SOS.displayCoords();
        }
      } catch(e) {
        SOS.coords = { lat: '28.6139', lng: '77.2090' };
        SOS.displayCoords();
      }
    },

    /** Display coordinates in UI */
    displayCoords: function() {
      const el1 = document.getElementById('sos-coords');
      const el2 = document.getElementById('sos-active-coords');
      const text = 'PIN ' + SOS.coords.lat + ' deg N, ' + SOS.coords.lng + ' deg E';
      if (el1) el1.textContent = text;
      if (el2) el2.textContent = text;
    },

    /** Activate SOS beacon */
    activate: function(isRestore) {
      SOS.active = true;
      SOS.zeroAlarmPlayed = false;
      Utils.store.set('sosActive', true);

      const idleEl = document.getElementById('sos-idle');
      const activeEl = document.getElementById('sos-active');
      if (idleEl) idleEl.style.display = 'none';
      if (activeEl) activeEl.classList.add('visible');

      if (GRIDLESS.mesh && GRIDLESS.mesh.setUserSOS) {
        GRIDLESS.mesh.setUserSOS(true);
      }

      if (!isRestore) {
        const expireTime = Date.now() + SOS_DURATION_SECONDS * 1000;
        Utils.store.set('sosExpireTime', expireTime);

        SOS.addAlert({
          severity: 'critical',
          source: MY_NODE_ID,
          message: 'SOS BEACON ACTIVATED - Emergency signal transmitted from ' + MY_NODE_ID + '. GPS coordinates locked. All nearby nodes: relay this signal and converge on position.',
          coords: SOS.coords ? SOS.coords.lat + ' deg N, ' + SOS.coords.lng + ' deg E' : 'Unknown',
          verified: 1
        });

        SOS.broadcastChatMessage();
      }

      SOS.startRepeatingBeep();

      if (SOS.timer) clearInterval(SOS.timer);

      const updateTimer = function() {
        let expireTime = Utils.store.get('sosExpireTime', 0);
        if (!expireTime) {
          expireTime = Date.now() + SOS_DURATION_SECONDS * 1000;
          Utils.store.set('sosExpireTime', expireTime);
        }

        const countdown = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000));
        SOS.renderTimer(countdown);

        if (countdown <= 0) {
          clearInterval(SOS.timer);
          SOS.timer = null;
          SOS.stopRepeatingBeep();
          if (!SOS.zeroAlarmPlayed) {
            SOS.zeroAlarmPlayed = true;
            SOS.playBeepPattern(8);
          }
          return;
        }
      };

      updateTimer();
      SOS.timer = setInterval(updateTimer, 1000);
    },

    /** Deactivate SOS beacon */
    deactivate: function() {
      SOS.active = false;
      SOS.zeroAlarmPlayed = false;
      Utils.store.set('sosActive', false);
      localStorage.removeItem('gridless:sosExpireTime');
      if (SOS.timer) clearInterval(SOS.timer);
      SOS.timer = null;
      SOS.stopRepeatingBeep();

      const idleEl = document.getElementById('sos-idle');
      const activeEl = document.getElementById('sos-active');
      if (idleEl) idleEl.style.display = '';
      if (activeEl) activeEl.classList.remove('visible');
      SOS.renderTimer(SOS_DURATION_SECONDS);

      if (GRIDLESS.mesh && GRIDLESS.mesh.setUserSOS) {
        GRIDLESS.mesh.setUserSOS(false);
      }

      if (SOS.audioCtx && SOS.audioCtx.state !== 'closed') {
        SOS.audioCtx.close();
        SOS.audioCtx = null;
      }
    },

    /** Render countdown in mm:ss */
    renderTimer: function(countdown) {
      const min = Math.floor(countdown / 60);
      const sec = countdown % 60;
      const timerEl = document.getElementById('sos-timer');
      if (timerEl) {
        timerEl.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
      }
    },

    /** Store alert locally, with live broadcast integration when available */
    addAlert: function(alert) {
      alert.id = alert.id || 'alert-' + Date.now();
      alert.timestamp = alert.timestamp || Date.now();
      alert.verified = alert.verified || 1;

      if (GRIDLESS.broadcast && GRIDLESS.broadcast.addAlert) {
        GRIDLESS.broadcast.addAlert(alert);
        return;
      }

      const alerts = Utils.store.get('alerts', []);
      alerts.unshift(alert);
      Utils.store.set('alerts', alerts);
    },

    /** Broadcast the SOS to open chat tabs when possible */
    broadcastChatMessage: function() {
      try {
        const channel = GRIDLESS.chat && GRIDLESS.chat.channel
          ? GRIDLESS.chat.channel
          : new BroadcastChannel('gridless-mesh-chat');

        channel.postMessage({
          id: 'sos-' + Date.now(),
          sender: MY_NODE_ID,
          text: 'SOS BEACON ACTIVATED - EMERGENCY - Coordinates: ' + (SOS.coords ? SOS.coords.lat + ' deg N, ' + SOS.coords.lng + ' deg E' : 'Unknown'),
          timestamp: Date.now(),
          hops: 1
        });

        if (!(GRIDLESS.chat && GRIDLESS.chat.channel)) channel.close();
      } catch(e) {}
    },

    /** Keep the siren repeating while the five-minute SOS timer is active */
    startRepeatingBeep: function() {
      SOS.stopRepeatingBeep();
      SOS.playBeepPattern(3);
      SOS.beepTimer = setInterval(function() {
        SOS.playBeepPattern(3);
      }, 1200);
    },

    /** Stop the repeating siren loop */
    stopRepeatingBeep: function() {
      if (SOS.beepTimer) {
        clearInterval(SOS.beepTimer);
        SOS.beepTimer = null;
      }
    },

    /** Play emergency siren beep pattern using Web Audio */
    playBeepPattern: function(repetitions) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        if (!SOS.audioCtx || SOS.audioCtx.state === 'closed') {
          SOS.audioCtx = new AudioContext();
        }

        if (SOS.audioCtx.state === 'suspended') {
          SOS.audioCtx.resume();
        }

        const ctx = SOS.audioCtx;
        const count = repetitions || 3;
        const now = ctx.currentTime;

        for (let i = 0; i < count; i++) {
          const start = now + i * 0.32;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(660, start);
          osc.frequency.exponentialRampToValueAtTime(980, start + 0.12);

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.24);
        }
      } catch(e) {
        console.error('Audio init failed:', e);
      }
    }
  };

  window.addEventListener('DOMContentLoaded', SOS.init || function(){});
  return SOS;
})();
