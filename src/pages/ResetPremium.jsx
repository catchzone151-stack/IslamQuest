import { useEffect, useState } from "react";
import { useProgressStore } from "../store/progressStore";

export default function ResetPremium() {
  const [status, setStatus] = useState("Resetting...");

  useEffect(() => {
    try {
      // Reset premium in Zustand store
      useProgressStore.setState({
        premium: false,
        premiumStatus: "free",
        premiumType: null,
        hasPremium: false,
        premiumActivatedAt: null
      });
      
      // Also update the localStorage directly with correct key
      const stored = localStorage.getItem("islamQuestProgress_v4");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state = {
          ...parsed.state,
          premium: false,
          premiumStatus: "free", 
          premiumType: null,
          hasPremium: false,
          premiumActivatedAt: null
        };
        localStorage.setItem("islamQuestProgress_v4", JSON.stringify(parsed));
      }
      
      console.log("✅ Premium status reset to free user");
      setStatus("Premium reset! Redirecting...");
      
      // Redirect to home after 1 second
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (e) {
      console.error("Reset error:", e);
      setStatus("Error resetting. Try clearing browser data.");
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0f1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        padding: "32px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "16px", color: "#D4AF37" }}>
        {status}
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#aaa" }}>
        You will be redirected to the home page...
      </p>
    </div>
  );
}
