import React from "react";
import { createRoot } from "react-dom/client";
import "@livekit/components-styles";
import "./styles.css";
import App from "./App.jsx";

class ErrorScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-shell">
          <div className="alert" role="alert">
            <h1>Frontend error</h1>
            <p>{this.state.error.message}</p>
            <p>Restart the frontend server, then refresh the page.</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorScreen>
    <App />
  </ErrorScreen>
);
