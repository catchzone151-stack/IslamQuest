import React, { useState } from "react";
import { useProgressStore } from "../store/progressStore";
import { supabase } from "../lib/supabaseClient";

export default function InviteFamilyMemberModal({ isOpen, onClose, onInvite }) {
  const [memberName, setMemberName] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState("input");
  const [memberAdded, setMemberAdded] = useState(false);
  
  const { familyPlanId } = useProgressStore();

  const resetModal = () => {
    setMemberName("");
    setInviteLink("");
    setLinkCopied(false);
    setIsGenerating(false);
    setStep("input");
    setMemberAdded(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const generateInviteLink = async () => {
    if (!memberName.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const inviteCode = `${familyPlanId || 'family'}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (userId && familyPlanId) {
        try {
          const { error: insertError } = await supabase.from("family_invites").insert({
            invite_code: inviteCode,
            inviter_id: userId,
            family_plan_id: familyPlanId,
            invitee_name: memberName.trim(),
            status: "pending",
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
          
          if (insertError) {
            console.log("[FamilyInvite] Supabase insert skipped (table may not exist):", insertError.message);
          } else {
            console.log("[FamilyInvite] Invite saved to Supabase");
          }
        } catch (dbError) {
          console.log("[FamilyInvite] Database operation skipped:", dbError.message);
        }
      }
      
      const link = `https://islamquest.app/join/${inviteCode}`;
      setInviteLink(link);
      setStep("share");
      
      addMemberToFamily();
      
    } catch (error) {
      console.error("Failed to generate invite link:", error);
      const fallbackCode = `family_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      const fallbackLink = `https://islamquest.app/join/${fallbackCode}`;
      setInviteLink(fallbackLink);
      setStep("share");
      
      addMemberToFamily();
    } finally {
      setIsGenerating(false);
    }
  };

  const addMemberToFamily = () => {
    if (memberAdded) {
      console.log("[FamilyInvite] Member already added, skipping duplicate");
      return;
    }
    
    if (onInvite && memberName.trim()) {
      onInvite(memberName.trim());
      setMemberAdded(true);
      console.log("[FamilyInvite] Member added to family:", memberName.trim());
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    const shareData = {
      title: "Join my IslamQuest Family Plan!",
      text: `${memberName}, you've been invited to join my IslamQuest Family Plan! Click the link to accept:`,
      url: inviteLink
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addMemberToFamily();
        handleClose();
      } else {
        await copyToClipboard();
        addMemberToFamily();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
        await copyToClipboard();
        addMemberToFamily();
      }
    }
  };

  const handleCopyAndAdd = async () => {
    await copyToClipboard();
    addMemberToFamily();
  };

  const handleComplete = () => {
    addMemberToFamily();
    handleClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "#0B1E2D",
          padding: "24px",
          borderRadius: "16px",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          textAlign: "center",
          maxWidth: "90%",
          width: "340px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "input" ? (
          <>
            <h3 style={{ color: "#D4AF37", marginBottom: "8px", fontSize: "1.3rem" }}>
              Invite Family Member
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px" }}>
              Enter their name to generate an invite link
            </p>
            
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Family member's name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,215,0,0.4)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                textAlign: "center",
                fontSize: "1rem",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") generateInviteLink();
              }}
            />
            
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button
                onClick={handleClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "transparent",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={generateInviteLink}
                disabled={!memberName.trim() || isGenerating}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: memberName.trim() ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" : "rgba(255,215,0,0.3)",
                  color: "#0B1E2D",
                  fontWeight: 600,
                  cursor: memberName.trim() ? "pointer" : "not-allowed",
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                {isGenerating ? "Generating..." : "Generate Link"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ color: "#D4AF37", marginBottom: "8px", fontSize: "1.3rem" }}>
              Invite Link Ready!
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "16px" }}>
              Share this link with <strong style={{ color: "#FFD700" }}>{memberName}</strong>
            </p>
            
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
                wordBreak: "break-all",
                fontSize: "0.8rem",
                color: "#94a3b8",
              }}
            >
              {inviteLink}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={shareLink}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  color: "#0B1E2D",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Share Link
              </button>
              
              <button
                onClick={handleCopyAndAdd}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,215,0,0.4)",
                  background: linkCopied ? "rgba(16, 185, 129, 0.2)" : "transparent",
                  color: linkCopied ? "#10b981" : "#FFD700",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {linkCopied ? "Copied!" : "Copy Link"}
              </button>
              
              <button
                onClick={handleComplete}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "transparent",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
