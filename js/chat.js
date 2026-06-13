GRIDLESS.chat = (function() {
  const Utils = GRIDLESS.utils;
  const MY_NODE_ID = GRIDLESS.MY_NODE_ID;
  const Chat = {
    channel: null,
    messages: [],

    /** Initialize chat with BroadcastChannel */
    init: function() {
      // Display node ID
      document.getElementById('chat-my-node').textContent = MY_NODE_ID;
      document.getElementById('header-node-id').textContent = MY_NODE_ID;

      // Load messages from storage
      Chat.messages = Utils.store.get('chatMessages', []);

      // Setup BroadcastChannel
      try {
        Chat.channel = new BroadcastChannel('gridless-mesh-chat');
        Chat.channel.onmessage = function(e) {
          Chat.receiveMessage(e.data);
        };
        document.getElementById('chat-channel-status').innerHTML = '<span style="color:var(--accent)">●</span> Channel Open';
      } catch(err) {
        document.getElementById('chat-channel-status').innerHTML = '<span style="color:var(--warning-amber)">●</span> Fallback Mode';
      }

      // Enter key to send
      document.getElementById('chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') Chat.send();
      });

      Chat.render();
    },

    /** Send a chat message */
    send: function() {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;

      const msg = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2,4),
        sender: MY_NODE_ID,
        text: text,
        timestamp: Date.now(),
        hops: 1
      };

      // Store locally
      Chat.messages.push(msg);
      Utils.store.set('chatMessages', Chat.messages.slice(-200)); // keep last 200

      // Broadcast to other tabs
      if (Chat.channel) {
        try {
          Chat.channel.postMessage(msg);
        } catch(e) { /* channel closed */ }
      }

      input.value = '';
      Chat.render();
      Chat.scrollToBottom();

      // Increment packets relayed
      Dashboard.packetsRelayed += Utils.randInt(1, 3);
    },

    /** Receive a message from BroadcastChannel */
    receiveMessage: function(msg) {
      // Avoid duplicates
      if (Chat.messages.some(function(m) { return m.id === msg.id; })) return;

      // Simulate hop count increase
      msg.hops = (msg.hops || 1) + Utils.randInt(1, 3);

      Chat.messages.push(msg);
      Utils.store.set('chatMessages', Chat.messages.slice(-200));
      Chat.render();
      Chat.scrollToBottom();
    },

    /** Render chat messages */
    render: function() {
      const container = document.getElementById('chat-messages');
      if (!container) return;

      container.innerHTML = Chat.messages.map(function(msg) {
        const isSelf = msg.sender === MY_NODE_ID;
        return '<div class="chat-msg ' + (isSelf ? 'self' : 'other') + ' fade-in">' +
          '<div class="chat-msg-header">' +
            '<span class="chat-msg-sender">' + msg.sender + '</span>' +
            '<span class="chat-msg-time">' + Utils.formatTimestamp(msg.timestamp) + '</span>' +
            '<span class="chat-msg-hops">⚡ ' + msg.hops + ' hop' + (msg.hops > 1 ? 's' : '') + '</span>' +
          '</div>' +
          '<div class="chat-msg-text">' + Chat.escapeHtml(msg.text) + '</div>' +
        '</div>';
      }).join('');
    },

    /** Scroll chat to bottom */
    scrollToBottom: function() {
      const container = document.getElementById('chat-messages');
      if (container) {
        setTimeout(function() { container.scrollTop = container.scrollHeight; }, 50);
      }
    },

    /** Escape HTML to prevent XSS */
    escapeHtml: function(str) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }
  };

  /* ===========================================================
     SOS BEACON
     =========================================================== */
  
  window.addEventListener('DOMContentLoaded', Chat.init || function(){});
  return Chat;
})();
