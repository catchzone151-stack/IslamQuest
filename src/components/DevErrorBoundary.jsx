import React from "react";

export default class DevErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // Keep the last error globally for quick access
    window.__lastError = { error, info, time: Date.now() };
    console.error("⛑️ DevErrorBoundary caught:", error, info);
  }
  render() {
    const isDev = import.meta.env.DEV;
    if (!this.state.error) return this.props.children;

    if (isDev) {
      const err = this.state.error;
      const route = window.location.hash || window.location.pathname;
      return (
        <div
          style={{
            fontFamily: "ui-sans-serif, system-ui",
            padding: 16,
            lineHeight: 1.4,
            background: "#fff",
            color: "#111",
          }}
        >
          <h1 style={{ marginBottom: 8 }}>💥 App crash (dev)</h1>
          <p>
            <b>Route:</b> {route}
          </p>
          <p>
            <b>Error:</b> {String(err && (err.message || err))}
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
            }}
          >
            {err && (err.stack || "").toString()}
          </pre>
          <p style={{ opacity: 0.8, fontSize: 12 }}>
            Tip: open DevTools → Console for component trace. Also check
            <code> window.__lastError </code>.
          </p>
        </div>
      );
    }
    // Production fallback
    return <div>Something went wrong.</div>;
  }
}
