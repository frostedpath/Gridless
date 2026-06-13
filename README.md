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
PLEASE OPEN SAME LINK IN TWO DIFFERENT TAB TO TEST PROPERLY ! Perform tasks in one Tab and see live updates in another Tab to see if the  prototype is working properly or not .

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

## Tech Stack
🔧 Technologies & Browser APIs Used
🌐 Core Web Technologies
HTML5
Used for creating a semantic and structured layout of the application.
CSS3
Handles styling, responsive design, gradients, animations, and visual effects to enhance UI/UX.
Vanilla JavaScript
Implements core functionality, interactivity, and application logic without external libraries.
📡 Browser APIs & Features
Geolocation API
Detects and displays the user’s real-time location coordinates.
LocalStorage
Stores SOS status and alert data persistently across browser sessions.
SessionStorage
Generates and maintains a unique node ID for each session.
BroadcastChannel API
Enables communication between different tabs/windows of the app to share SOS alerts in real time.
Web Audio API
Produces emergency sounds such as beeps or sirens for alert notifications.
🎨 UI & Design Elements
SVG Icons
Lightweight and scalable graphics for navigation and interface elements.
Google Fonts (Share Tech Mono)
Provides a tactical, terminal-style aesthetic for the application.
## Note

GRIDLESS is a simulation/prototype interface and should not be used as a replacement for real emergency services or official disaster communication systems.
