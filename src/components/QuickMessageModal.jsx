import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

const QUICK_MESSAGES = [
  { id: 1, text: "Assalamu alaikum! 👋", emoji: "👋" },
  { id: 2, text: "May Allah ﷻ bless you! 🤲", emoji: "🤲" },
  { id: 3, text: "JazakAllah ﷻ Khair! 🌟", emoji: "🌟" },
  { id: 4, text: "Keep up the great work! 💪", emoji: "💪" },
  { id: 5, text: "Let's learn together! 📚", emoji: "📚" },
  { id: 6, text: "Challenge me again! ⚔️", emoji: "⚔️" },
  { id: 7, text: "MashaAllah ﷻ! Amazing progress! 🎯", emoji: "🎯" },
  { id: 8, text: "See you in Jannah! 🌙", emoji: "🌙" }
];

export default function QuickMessageModal({ friend, onClose }) {
  const handleSendMessage = (message) => {
    console.log(`Sending "${message.text}" to ${friend.nickname}`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 10000,
          padding: 0
        }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(180deg, #0A1A2F 0%, #081426 100%)",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            padding: "24px",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "70vh",
            overflowY: "auto",
            boxShadow: "0 -4px 30px rgba(212, 175, 55, 0.3)"
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px"
          }}>
            <h3 style={{
              color: "#D4AF37",
              fontSize: "1.3rem",
              fontWeight: "700",
              margin: 0
            }}>
              Quick Message
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#888",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Friend Info */}
          <div style={{
            textAlign: "center",
            marginBottom: "24px",
            padding: "16px",
            background: "rgba(212, 175, 55, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(212, 175, 55, 0.3)"
          }}>
            <p style={{
              color: "#fff",
              fontSize: "1rem",
              marginBottom: "4px"
            }}>
              Send a quick message to
            </p>
            <p style={{
              color: "#D4AF37",
              fontSize: "1.2rem",
              fontWeight: "600",
              margin: 0
            }}>
              {friend.nickname}
            </p>
          </div>

          {/* Quick Message Options */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "12px"
          }}>
            {QUICK_MESSAGES.map((message) => (
              <motion.button
                key={message.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSendMessage(message)}
                style={{
                  background: "rgba(14, 22, 37, 0.8)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  fontSize: "1.5rem",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(212, 175, 55, 0.2)",
                  borderRadius: "50%"
                }}>
                  {message.emoji}
                </div>
                <p style={{
                  color: "#fff",
                  fontSize: "1rem",
                  margin: 0,
                  flex: 1,
                  textAlign: "left"
                }}>
                  {message.text}
                </p>
                <Send size={18} color="#10b981" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
