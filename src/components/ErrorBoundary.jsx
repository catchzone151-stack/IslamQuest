import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#0a2a43",
            color: "white",
            textAlign: "center",
            padding: "20px",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>⚠️ Oops!</h1>
          <p style={{ fontSize: "1rem", opacity: 0.9 }}>
            Something went wrong — please restart the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#D4AF37",
              color: "#0a2a43",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "12px",
            }}
          >
            Restart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
