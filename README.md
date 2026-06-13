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
assets/        audio and icon assets
css/           app styling
js/            app logic
*.html         app pages
```

## Note

GRIDLESS is a simulation/prototype interface and should not be used as a replacement for real emergency services or official disaster communication systems.
