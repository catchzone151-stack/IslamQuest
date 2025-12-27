import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";
import { ChevronLeft, Trash2 } from "lucide-react";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { logEvent, ANALYTICS_EVENTS } from "../services/analyticsService";

export default function Settings() {
  const navigate = useNavigate();
  const { 
    vibrationEnabled, 
    setVibrationEnabled, 
    resetAllProgress
  } = useProgressStore();
  const { resetUserData, setOnboarded } = useUserStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleVibrationToggle = () => {
    setVibrationEnabled(!vibrationEnabled);
    if (!vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleLogout = async () => {
    logEvent(ANALYTICS_EVENTS.LOGOUT, {});
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }

    resetUserData();
    resetAllProgress();
    setOnboarded(false);
    
    localStorage.setItem("iq_onboarding_step", "auth");

    navigate("/auth", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.error("No active session for account deletion");
        setIsDeleting(false);
        return;
      }

      const userId = session.user.id;
      console.log("🗑️ Starting account deletion for user:", userId);

      // Delete user data from all tables (order matters for foreign key constraints)
      const tablesToDelete = [
        "friend_challenges",
        "event_entries",
        "revision_items",
        "daily_quests",
        "lesson_progress",
        "challenge_logs",
        "xp_logs",
        "streak_logs",
        "leaderboard_snapshots",
        "push_tokens",
        "purchases",
        "profiles"
      ];

      for (const table of tablesToDelete) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", userId);
        
        if (error) {
          console.warn(`Warning deleting from ${table}:`, error.message);
          // Continue with other tables even if one fails
        } else {
          console.log(`✅ Deleted from ${table}`);
        }
      }

      // Log the deletion event before signing out
      logEvent(ANALYTICS_EVENTS.ACCOUNT_DELETED, {});

      // Sign out the user
      await supabase.auth.signOut();
      
      // Clear all local data
      resetUserData();
      resetAllProgress();
      setOnboarded(false);
      
      // Clear localStorage items
      localStorage.removeItem("iq_hidden_identity_v1");
      localStorage.removeItem("iq_onboarding_step");
      localStorage.removeItem("iq_profile_complete");
      localStorage.removeItem("iq_user_store");
      localStorage.removeItem("iq_progress_store");
      localStorage.removeItem("iq_revise_store");
      localStorage.removeItem("iq_daily_quests");
      localStorage.removeItem("iq_challenge_store");
      
      console.log("✅ Account deletion complete");
      
      setShowDeleteModal(false);
      navigate("/goodbye", { replace: true });
      
    } catch (err) {
      console.error("Account deletion error:", err);
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer>
      <div
        style={{
          padding: "20px 20px 90px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <button
            onClick={() => navigate("/profile")}
            style={{
              background: "transparent",
              border: "none",
              color: "#4fd5ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(90deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Settings
          </h1>
        </div>

        <div
          style={{
            maxWidth: 400,
            margin: "0 auto",
            padding: 20,
            background: "rgba(79, 213, 255, 0.05)",
            border: "1px solid rgba(79, 213, 255, 0.2)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: 14,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
              🔊 Vibration (Haptics)
            </span>
            <button
              onClick={handleVibrationToggle}
              style={{
                background: vibrationEnabled
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(79, 213, 255, 0.3)",
                borderRadius: 20,
                padding: "6px 14px",
                color: vibrationEnabled ? "white" : "#4fd5ff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.3s",
              }}
            >
              {vibrationEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: 14,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
              App Version
            </span>
            <span style={{ color: "#d4af37", fontSize: "0.9rem", fontWeight: 600 }}>
              Islam Quest v1.0.0
            </span>
          </div>
        </div>

        <div
          style={{
            maxWidth: 400,
            margin: "20px auto 0",
            padding: 20,
            background: "rgba(79, 213, 255, 0.05)",
            border: "1px solid rgba(79, 213, 255, 0.2)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "0.9rem",
              width: "100%",
              cursor: "pointer",
              marginTop: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.2) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)";
            }}
          >
            Log Out
          </button>
        </div>

        <div
          style={{
            maxWidth: 400,
            margin: "32px auto 0",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 50%, transparent 100%)",
              marginBottom: 20,
            }}
          />
          
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 12,
              padding: "14px 16px",
              color: "rgba(239, 68, 68, 0.7)",
              fontWeight: "500",
              fontSize: "0.9rem",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.color = "rgba(239, 68, 68, 0.7)";
            }}
          >
            <Trash2 size={16} />
            Delete My Account
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </ScreenContainer>
  );
}
