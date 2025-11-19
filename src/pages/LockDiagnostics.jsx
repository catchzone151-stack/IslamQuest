import React from "react";
import { useProgressStore } from "../store/progressStore";

export default function LockDiagnostics() {
  const { hasPremium, lockedLessons, lessonStates } = useProgressStore();
  
  return (
    <div className="screen no-extra-space" style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", background: "#0B1E2D", color: "white" }}>
      <h1>🔒 Lock Diagnostics</h1>
      
      <div style={{ background: "#1a2337", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>Premium Status</h2>
        <p><strong>hasPremium:</strong> {hasPremium ? "✅ TRUE (ALL LESSONS UNLOCKED)" : "❌ FALSE"}</p>
      </div>
      
      <div style={{ background: "#1a2337", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>Locked Lessons Structure</h2>
        <pre style={{ background: "#0a1520", padding: "10px", borderRadius: "4px", overflow: "auto" }}>
          {JSON.stringify(lockedLessons, null, 2)}
        </pre>
      </div>
      
      <div style={{ background: "#1a2337", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>Lesson States (Completed Lessons)</h2>
        <pre style={{ background: "#0a1520", padding: "10px", borderRadius: "4px", overflow: "auto", maxHeight: "400px" }}>
          {JSON.stringify(lessonStates, null, 2)}
        </pre>
      </div>
      
      <div style={{ background: "#1a2337", padding: "20px", borderRadius: "8px" }}>
        <h2>Path-by-Path Lock Status</h2>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(pathId => {
          const pathLocks = lockedLessons[pathId] || {};
          const unlockedLessons = Object.keys(pathLocks).filter(
            lessonId => pathLocks[lessonId]?.unlocked
          );
          
          return (
            <div key={pathId} style={{ marginBottom: "10px", padding: "10px", background: "#0a1520", borderRadius: "4px" }}>
              <strong>Path {pathId}:</strong> {unlockedLessons.length} lessons unlocked
              <br />
              <span style={{ fontSize: "0.9em", color: "#D4AF37" }}>
                Unlocked lessons: {unlockedLessons.length > 0 ? unlockedLessons.join(", ") : "None"}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: "12px 24px",
            background: "#D4AF37",
            color: "#0B1E2D",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Clear All Data & Reload
        </button>
      </div>
    </div>
  );
}
