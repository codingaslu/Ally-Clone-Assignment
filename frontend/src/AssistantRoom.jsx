import {
  LiveKitRoom,
  RoomAudioRenderer,
  useChat,
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import {
  AlertTriangle,
  BookOpenText,
  Camera,
  CameraOff,
  Ear,
  Mic,
  MicOff,
  RefreshCcw,
  Send,
  Square,
  Waypoints,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

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

export default function AssistantRoom({ session, onStop }) {
  return (
    <LiveKitRoom
      serverUrl={session.url}
      token={session.token}
      connect
      audio
      video={{
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      }}
      onDisconnected={onStop}
      className="room"
    >
      <ConnectedAssistantRoom onStop={onStop} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function ConnectedAssistantRoom({ onStop }) {
  const connectionState = useConnectionState();
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const { chatMessages, send } = useChat();
  const [typedMessage, setTypedMessage] = useState("");
  const [statusText, setStatusText] = useState("Connecting");
  const [controlError, setControlError] = useState("");
  const messageEndRef = useRef(null);

  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const localCameraTrack = useMemo(
    () => cameraTracks.find((track) => track.participant?.isLocal),
    [cameraTracks]
  );

  useEffect(() => {
    const hasAgent = remoteParticipants.some((participant) =>
      participant.identity.toLowerCase().includes("agent")
    );

    if (connectionState === ConnectionState.Connected && hasAgent) {
      setStatusText("AI agent joined. Turn mic and camera on, then speak.");
    } else if (connectionState === ConnectionState.Connected) {
      setStatusText("Room connected. Waiting for AI agent to join.");
    } else {
      setStatusText(`Connection status: ${connectionState}`);
    }
  }, [connectionState, remoteParticipants]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages]);

  async function toggleMicrophone() {
    setControlError("");
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      setControlError("Microphone did not start. Allow microphone permission in the browser.");
    }
  }

  async function toggleCamera() {
    setControlError("");
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (error) {
      setControlError("Camera did not start. Allow camera permission in the browser.");
    }
  }

  async function sendMessage(message) {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    await send(cleanMessage);
    setTypedMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(typedMessage);
  }

  return (
    <section className="assistant-layout">
      <div className="controls-panel">
        <div className="status-line" role="status" aria-live="polite">
          {statusText}
        </div>
        {controlError ? (
          <div className="alert" role="alert">
            {controlError}
          </div>
        ) : null}

        <div className="primary-controls" aria-label="Main controls">
          <button className="button stop" onClick={onStop} aria-label="Stop assistant">
            <Square aria-hidden="true" />
            Stop Assistant
          </button>
          <button
            className="button"
            onClick={toggleMicrophone}
            aria-label={isMicrophoneEnabled ? "Turn microphone off" : "Turn microphone on"}
          >
            {isMicrophoneEnabled ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
            {isMicrophoneEnabled ? "Mic On" : "Mic Off"}
          </button>
          <button
            className="button"
            onClick={toggleCamera}
            aria-label={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
          >
            {isCameraEnabled ? <Camera aria-hidden="true" /> : <CameraOff aria-hidden="true" />}
            {isCameraEnabled ? "Camera On" : "Camera Off"}
          </button>
        </div>

        <div className="quick-actions" aria-label="Assistant quick actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className={`button action ${action.className}`}
                onClick={() => sendMessage(action.message)}
                aria-label={action.label}
              >
                <Icon aria-hidden="true" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="camera-panel" aria-label="Camera preview">
        <div className="panel-heading">
          <Camera aria-hidden="true" />
          <h2>Camera</h2>
        </div>
        <div className="video-frame">
          {localCameraTrack?.publication ? (
            <VideoTrack trackRef={localCameraTrack} />
          ) : (
            <div className="empty-video">
              <CameraOff aria-hidden="true" />
              <span>Camera preview unavailable</span>
            </div>
          )}
        </div>
      </section>

      <section className="chat-panel" aria-label="Conversation">
        <div className="panel-heading">
          <Ear aria-hidden="true" />
          <h2>Conversation</h2>
        </div>

        <div className="messages" aria-live="polite">
          {chatMessages.length === 0 ? (
            <p className="empty-state">
              Speak or type a question, such as "What is ahead?" or "Read this page."
            </p>
          ) : (
            chatMessages.map((message) => (
              <article
                key={`${message.timestamp}-${message.from?.identity || "system"}`}
                className={`message ${
                  message.from?.isLocal ? "message-user" : "message-assistant"
                }`}
              >
                <span className="message-author">
                  {message.from?.isLocal ? "You" : "Assistant"}
                </span>
                <p>{message.message}</p>
              </article>
            ))
          )}
          <div ref={messageEndRef} />
        </div>

        <form className="message-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="message">
            Type a message to the assistant
          </label>
          <input
            id="message"
            value={typedMessage}
            onChange={(event) => setTypedMessage(event.target.value)}
            placeholder="Type: What is ahead?"
            autoComplete="off"
          />
          <button className="button send" type="submit" aria-label="Send message">
            <Send aria-hidden="true" />
            Send
          </button>
        </form>
      </section>
    </section>
  );
}
