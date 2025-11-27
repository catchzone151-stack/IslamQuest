import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, Smartphone } from "lucide-react";

const iconMap = {
  success: { icon: CheckCircle, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.3)" },
  error: { icon: XCircle, color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgba(239, 68, 68, 0.3)" },
  warning: { icon: AlertTriangle, color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.15)", borderColor: "rgba(251, 191, 36, 0.3)" },
  info: { icon: Info, color: "#4fd5ff", bgColor: "rgba(79, 213, 255, 0.15)", borderColor: "rgba(79, 213, 255, 0.3)" },
  device: { icon: Smartphone, color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.15)", borderColor: "rgba(251, 191, 36, 0.3)" },
};

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "info",
  buttonText = "OK" 
}) {
  if (!isOpen) return null;

  const config = iconMap[type] || iconMap.info;
  const IconComponent = config.icon;

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
          background: "rgba(0,0,0,0.85)",
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
            border: `1px solid ${config.borderColor}`,
            borderRadius: "20px",
            padding: "28px 24px",
            maxWidth: "340px",
            width: "100%",
            textAlign: "center",
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${config.bgColor}`,
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: config.bgColor,
              border: `2px solid ${config.borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <IconComponent size={28} color={config.color} />
          </div>

          {title && (
            <h3
              style={{
                color: config.color,
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h3>
          )}

          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.95rem",
              marginBottom: "24px",
              lineHeight: "1.6",
            }}
          >
            {message}
          </p>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
              color: type === "warning" || type === "device" ? "#0a1929" : "white",
              border: "none",
              padding: "14px 16px",
              borderRadius: "12px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: `0 4px 12px ${config.bgColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 6px 20px ${config.bgColor}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${config.bgColor}`;
            }}
          >
            {buttonText}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
