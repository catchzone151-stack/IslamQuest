import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";

export default function ProfileSetupWait() {
  const [retrying, setRetrying] = useState(false);
  const maxRetriesReached = useUserStore(s => s.maxRetriesReached);

  const handleRetry = async () => {
    setRetrying(true);
    await useUserStore.getState().retryInit();
    setRetrying(false);
  };

  if (maxRetriesReached) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          color: "white",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
          Account setup is taking longer than expected.
        </p>
        <p style={{ fontSize: "0.9rem", color: "#a0aec0", margin: 0 }}>
          Please try again later or contact support if this continues.
        </p>
      </div>
    );
  }

  return (
    <div
      className="screen no-extra-space"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        color: "white",
        padding: "32px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
        Setting up your account…
      </p>
      <p style={{ fontSize: "0.9rem", color: "#a0aec0", margin: 0 }}>
        This usually takes just a moment.
      </p>
      <button
        onClick={handleRetry}
        disabled={retrying}
        style={{
          marginTop: "8px",
          padding: "10px 24px",
          borderRadius: "12px",
          border: "none",
          background: retrying ? "#2d4a6e" : "#1e6fd9",
          color: "white",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: retrying ? "not-allowed" : "pointer",
        }}
      >
        {retrying ? "Checking…" : "Try Again"}
      </button>
    </div>
  );
}
