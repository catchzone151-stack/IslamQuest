import { useEffect, useState } from "react";

export default function DevRepair({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Catch global JS errors gracefully
    const handler = (e) => {
      setError(e.error || e.message || "Unknown error");
      console.error("💥 DevRepair caught:", e.error || e.message);
    };
    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #081426, #0e2340)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 20,
        }}
      >
        <h2 style={{ color: "gold" }}>⚠️ Developer Repair Mode</h2>
        <p>Something went wrong while rendering this page.</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>{String(error)}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            background: "gold",
            border: "none",
            padding: "10px 18px",
            borderRadius: 10,
            fontWeight: "bold",
            cursor: "pointer",
            color: "#0b2145",
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  return children;
}
