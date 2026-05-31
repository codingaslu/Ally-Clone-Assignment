import {
  AlertTriangle,
  BookOpenText,
  Play,
  RefreshCcw,
  UserRoundCheck,
  Waypoints,
} from "lucide-react";
import React, { lazy, Suspense, useState } from "react";

const AssistantRoom = lazy(() => import("./AssistantRoom.jsx"));

const tokenEndpoint =
  import.meta.env.VITE_TOKEN_ENDPOINT || "http://localhost:3001/api/token";

const quickActions = [
  {
    label: "Walking Mode",
    icon: Waypoints,
    message: "What is ahead while walking? Use short safety mode.",
    className: "primary",
  },
  {
    label: "Text Reading",
    icon: BookOpenText,
    message: "Read the text in front of me.",
    className: "primary",
  },
  {
    label: "Repeat Last",
    icon: RefreshCcw,
    message: "Repeat last answer.",
    className: "secondary",
  },
  {
    label: "Emergency Help",
    icon: AlertTriangle,
    message: "Check surroundings for emergency danger.",
    className: "danger",
  },
];

function App() {
  const [session, setSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  async function startAssistant() {
    setError("");
    setIsStarting(true);

    try {
      const room = `vision-${Date.now()}`;
      const name = `student-${Math.floor(Math.random() * 10000)}`;
      const response = await fetch(
        `${tokenEndpoint}?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        throw new Error("Could not create LiveKit session token.");
      }

      const data = await response.json();
      setSession(data);
    } catch (startError) {
      setError(startError.message || "Unable to start assistant.");
    } finally {
      setIsStarting(false);
    }
  }

  function stopAssistant() {
    setSession(null);
  }

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Assistant status">
        <div>
          <h1>Shals Vision Assistant</h1>
          <p>Camera and voice support for blind and visually impaired users.</p>
        </div>
        <StatusBadge connected={Boolean(session)} />
      </section>

      {error ? (
        <div className="alert" role="alert">
          {error}
        </div>
      ) : null}

      {!session ? (
        <section className="start-panel" aria-labelledby="start-title">
          <div>
            <h2 id="start-title">Start Assistant</h2>
            <p>
              This opens microphone and camera, then connects to your LiveKit
              voice agent.
            </p>
          </div>
          <button
            className="button start-button"
            onClick={startAssistant}
            disabled={isStarting}
            aria-label="Start assistant session"
          >
            <Play aria-hidden="true" />
            {isStarting ? "Starting..." : "Start Assistant"}
          </button>
        </section>
      ) : (
        <Suspense
          fallback={
            <section className="start-panel" role="status">
              <h2>Loading assistant controls...</h2>
            </section>
          }
        >
          <AssistantRoom session={session} onStop={stopAssistant} />
        </Suspense>
      )}
    </main>
  );
}

function StatusBadge({ connected }) {
  return (
    <div className={connected ? "status connected" : "status"}>
      <UserRoundCheck aria-hidden="true" />
      <span>{connected ? "Assistant connected" : "Not connected"}</span>
    </div>
  );
}

export default App;
