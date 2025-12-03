import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { supabase } from "../lib/supabaseClient";
import { ChevronLeft, Users, UserPlus, UserMinus, Crown, Trash2 } from "lucide-react";
import RemoveFamilyMemberModal from "../components/RemoveFamilyMemberModal";
import InviteFamilyMemberModal from "../components/InviteFamilyMemberModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { getAvatarImage } from "../utils/avatarUtils";
import { logEvent, ANALYTICS_EVENTS } from "../services/analyticsService";

export default function Settings() {
  const navigate = useNavigate();
  const { showModal } = useModalStore();
  const { 
    vibrationEnabled, 
    setVibrationEnabled, 
    resetAllProgress,
    premiumType,
    familyMembers,
    familyPlanId,
    removeFamilyMember,
    addFamilyMember
  } = useProgressStore();
  const { resetUserData, setOnboarded } = useUserStore();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const isFamilyPlanOwner = premiumType === "family";
  const maxFamilyMembers = 5;
  const availableSlots = maxFamilyMembers - (familyMembers?.length || 0);

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToRemove) {
      await removeFamilyMember(memberToRemove.id);
      setMemberToRemove(null);
    }
  };

  const handleInviteMember = (memberData) => {
    addFamilyMember(memberData);
  };

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
    localStorage.removeItem("iq_onboarding_step");

    navigate("/auth", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error("No active session for account deletion");
        setIsDeleting(false);
        return;
      }

      const response = await supabase.functions.invoke("delete-user-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error("Account deletion failed:", response.error);
        setIsDeleting(false);
        return;
      }

      logEvent(ANALYTICS_EVENTS.ACCOUNT_DELETED, {});
      
      resetUserData();
      resetAllProgress();
      setOnboarded(false);
      
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
        {/* Header with Back Button */}
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

        {/* Settings Panel */}
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
          {/* Vibration Toggle */}
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

          {/* App Version */}
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

        {/* Family Plan Management - Only shown for family plan owners */}
        {isFamilyPlanOwner && (
          <div
            style={{
              maxWidth: 400,
              margin: "20px auto 0",
              padding: 20,
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(79, 213, 255, 0.05) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Family Plan Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #D4AF37 0%, #FFA500 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Crown size={20} color="#0a2a43" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#D4AF37" }}>
                  Family Plan
                </h3>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  {familyMembers?.length || 0} of {maxFamilyMembers} members
                </p>
              </div>
            </div>

            {/* Family Members List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {familyMembers && familyMembers.length > 0 ? (
                familyMembers.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={getAvatarImage(member.avatar)}
                        alt={member.name}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "2px solid rgba(212, 175, 55, 0.3)",
                        }}
                      />
                      <div>
                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "white" }}>
                          {member.name}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: "#ef4444",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                      }}
                    >
                      <UserMinus size={14} />
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 12,
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  <Users size={32} color="rgba(255,255,255,0.3)" style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                    No family members added yet
                  </p>
                </div>
              )}
            </div>

            {/* Add Member Button */}
            {availableSlots > 0 && (
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  color: "#10b981",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.25) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)";
                }}
              >
                <UserPlus size={18} />
                Add Family Member ({availableSlots} slot{availableSlots !== 1 ? 's' : ''} available)
              </button>
            )}

            {/* Full Message */}
            {availableSlots === 0 && (
              <div
                style={{
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#fbbf24" }}>
                  Family plan is full. Remove a member to add someone new.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Settings Panel */}
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
          {/* Rate App Button */}
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block" }}
          >
            <button
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: 12,
                padding: "12px 16px",
                color: "#d4af37",
                fontWeight: "600",
                fontSize: "0.9rem",
                width: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(244, 208, 63, 0.2) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)";
              }}
            >
              ⭐ Rate this App
            </button>
          </a>

          {/* Log Out Button */}
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

        {/* Delete Account Section - At the very bottom with divider */}
        <div
          style={{
            maxWidth: 400,
            margin: "32px auto 0",
            padding: "0 20px",
          }}
        >
          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 50%, transparent 100%)",
              marginBottom: 20,
            }}
          />
          
          {/* Delete Account Button */}
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

      {/* Remove Family Member Confirmation Modal */}
      <RemoveFamilyMemberModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setMemberToRemove(null);
        }}
        memberName={memberToRemove?.name || ""}
        onConfirm={confirmRemoveMember}
      />

      {/* Invite Family Member Modal */}
      <InviteFamilyMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        familyPlanId={familyPlanId}
        onInvite={handleInviteMember}
      />

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </ScreenContainer>
  );
}
