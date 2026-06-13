# GRIDLESS

GRIDLESS is an offline-first emergency mesh communication web app for internet blackouts, disasters, and local crisis response. It includes SOS beacons, emergency broadcasts, mesh node simulation, local chat, GPS-style coordinates, and repeating siren alert behavior.

## Key Features

- SOS beacon with a 5-minute countdown
- Repeating emergency siren beep during SOS mode
- Mesh network node simulation
- Critical, warning, and info emergency broadcasts
- Local same-device chat using browser tabs
- GPS-style coordinate display
- Dashboard with active nodes, signal health, packets relayed, and uptime
- Lightweight static web app that runs locally in a browser

## Front End link :
https://gridless-001.vercel.app/index.html

## Pages

- `index.html` - dashboard overview
- `mesh.html` - mesh network view
- `broadcast.html` - emergency alert feed
- `chat.html` - local chat
- `sos.html` - SOS beacon screen

## Run Locally

Open `index.html` directly in a browser.

For chat testing, open `chat.html` in multiple tabs on the same laptop/browser. The current chat uses `BroadcastChannel`, so it does not sync across different laptops without a relay/server.

## Project Structure

```text
gridless/
├── index.html              ← Landing + dashboard (main entry)
├── broadcast.html          ← Emergency broadcast board (read-only alerts)
├── mesh.html               ← Mesh network map (visual node connections)
├── chat.html               ← Local peer chat (simulated P2P)
├── sos.html                ← SOS signal sender
│
├── css/
│   └── styles.css          ← Global dark/terminal theme
│
├── js/
│   ├── mesh-sim.js         ← Mesh network simulation logic
│   ├── chat.js             ← LocalStorage-based chat state
│   ├── broadcast.js        ← Alert feed rendering
│   └── sos.js              ← SOS beacon logic + countdown
│
└── assets/
    └── icons/              ← SVG icons (signal, node, warning, etc.)
```

## Note

GRIDLESS is a simulation/prototype interface and should not be used as a replacement for real emergency services or official disaster communication systems.
