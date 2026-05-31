# Shals Vision Assistant Frontend

Accessible React frontend for the LiveKit-based Voice Vision Assistant.

## What It Does

- Connects to the Python LiveKit agent.
- Turns on microphone and camera.
- Tries to use the mobile back camera with `facingMode: environment`.
- Plays assistant audio responses.
- Shows a simple conversation area.
- Provides large accessible buttons for walking mode, text reading, repeat, and emergency checks.

## Folder Structure

```text
frontend/
├── index.html
├── package.json
├── .env.example
├── server/
│   └── token-server.js
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Setup

From the project root, first run your Python agent:

```powershell
python app.py dev
```

In a second terminal:

```powershell
cd frontend
npm install
```

Your root project already has `.env` with LiveKit credentials. The token server reads that root `.env`.

If you want a frontend-only env file, copy:

```powershell
copy .env.example .env
```

Then set:

```text
VITE_TOKEN_ENDPOINT=http://localhost:3001/api/token
```

Do not put LiveKit API secret in browser code.

## Run

Start the token server and React app together:

```powershell
npm run start
```

Open the Vite URL shown in terminal, usually:

```text
http://localhost:5173
```

Click **Start Assistant**, allow microphone and camera, then try:

```text
What is ahead while walking?
Read this page.
Check surroundings for emergency danger.
Repeat last answer.
```

## Android Testing

Open the frontend URL on an Android phone connected to the same network. The app requests the environment/back camera when available.

For real deployment, host the frontend and token server over HTTPS. Mobile browsers usually require HTTPS for camera and microphone outside localhost.
