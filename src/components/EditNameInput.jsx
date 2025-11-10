import React, { useState } from "react";

export default function EditNameInput({ defaultName, onSave }) {
  const [name, setName] = useState(defaultName || "");

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid rgba(255,215,0,0.4)",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          textAlign: "center",
        }}
      />
      <button
        onClick={() => onSave(name)}
        style={{
          marginLeft: "10px",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          background: "#FFD700",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
