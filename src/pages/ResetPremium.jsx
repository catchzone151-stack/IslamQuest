import { useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";

export default function ResetPremium() {
  const navigate = useNavigate();
  const resetProgress = useProgressStore.getState;

  useEffect(() => {
    // Clear premium flags from storage
    const state = resetProgress();
    state.premium = false;
    state.premiumStatus = "free";
    state.premiumType = null;
    state.hasPremium = false;
    
    // Save to localStorage
    useProgressStore.setState({
      premium: false,
      premiumStatus: "free",
      premiumType: null,
      hasPremium: false,
      premiumActivatedAt: null
    });
    
    // Force save to localStorage
    const currentState = useProgressStore.getState();
    localStorage.setItem("iq_production_v1_progress", JSON.stringify(currentState));
    
    console.log("✅ Premium status reset to free user");
    
    // Redirect to home after 1 second
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
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
        Resetting Premium Status...
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#aaa" }}>
        Clearing premium flags and redirecting to home...
      </p>
    </div>
  );
}
