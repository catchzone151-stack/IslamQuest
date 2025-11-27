import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserMinus, AlertTriangle } from "lucide-react";

export default function RemoveFamilyMemberModal({ isOpen, onClose, memberName, onConfirm }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(180deg, #0B1E2D 0%, #0a1929 100%)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "20px",
            padding: "28px 24px",
            maxWidth: "340px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(239, 68, 68, 0.1)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.15) 100%)",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <UserMinus size={28} color="#ef4444" />
          </div>

          <h3
            style={{
              color: "#ef4444",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            Remove Family Member?
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.95rem",
              marginBottom: "8px",
              lineHeight: "1.5",
            }}
          >
            Are you sure you want to remove
          </p>

          <p
            style={{
              color: "#D4AF37",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            {memberName}
          </p>

          <div
            style={{
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.8rem",
                textAlign: "left",
                lineHeight: "1.4",
                margin: 0,
              }}
            >
              This will free up a slot for a new family member. They will lose access to premium features.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.8)",
                padding: "14px 16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                padding: "14px 16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Yes, Remove
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
