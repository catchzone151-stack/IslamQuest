// src/components/quiz/RewardModal.jsx

import React, { useEffect } from "react";
import { useVibration } from "../../hooks/useVibration";
import xpIcon from "../../assets/ui/ui_xp.webp";
import coinIcon from "../../assets/ui/ui_coin.webp";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle = {
  background: "#0b132b",
  borderRadius: "24px",
  padding: "24px 20px",
  width: "90%",
  maxWidth: "420px",
  textAlign: "center",
  color: "#ffffff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  border: "1px solid #1f2b4d",
  position: "relative",
};

const mascotStyle = {
  width: "96px",
  height: "auto",
  margin: "0 auto 16px",
  animation: "iq-bounce 1.4s infinite",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#ffffff",
  textShadow: "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)",
  marginBottom: "4px",
};

const messageStyle = {
  fontSize: "15px",
  marginBottom: "18px",
};

const rewardsRowStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "24px",
  marginBottom: "20px",
};

const rewardItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
  color: "#FACC15",
};

const iconStyle = {
  width: "20px",
  height: "20px",
};

const buttonStyle = {
  backgroundColor: "#FACC15",
  color: "#111827",
  border: "none",
  padding: "10px 22px",
  borderRadius: "999px",
  fontWeight: 600,
  fontSize: "15px",
  cursor: "pointer",
  transition: "background-color 0.2s, transform 0.1s",
};

const buttonHoverStyle = {
  backgroundColor: "#fde68a",
  transform: "translateY(-1px)",
};

function RewardModalContent({ score, totalQ, xp, coins, mascotImg, onContinue, onRetry, passed }) {
  const { vibrate } = useVibration();
  const [hoverContinue, setHoverContinue] = React.useState(false);
  const [hoverRetry, setHoverRetry] = React.useState(false);

  // Trigger haptic feedback when modal appears
  useEffect(() => {
    if (passed) {
      vibrate([100, 50, 100, 50, 100]); // Victory pattern
    } else {
      vibrate([200, 100, 200]); // Failure pattern
    }
  }, [passed, vibrate]);

  return (
    <>
      <style>
        {`
        @keyframes iq-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}
      </style>

      <div style={overlayStyle}>
        <div style={modalStyle}>
          <img src={mascotImg} alt="Mascot" style={mascotStyle} />

          <h2 style={titleStyle}>
            {passed ? "masha'Allah!" : "Keep trying!"}
          </h2>

          <p style={messageStyle}>
            {passed
              ? `You scored ${score} out of ${totalQ}. Well done!`
              : `You scored ${score} out of ${totalQ}. Let's improve!`}
          </p>

          {passed && (xp > 0 || coins > 0) && (
            <div style={rewardsRowStyle}>
              {xp > 0 && (
                <div style={rewardItemStyle}>
                  <img src={xpIcon} alt="XP" style={iconStyle} />
                  <span>+{xp} XP</span>
                </div>
              )}
              {coins > 0 && (
                <div style={rewardItemStyle}>
                  <img src={coinIcon} alt="Coins" style={iconStyle} />
                  <span>+{coins} Coins</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px", justifyContent: "center" }}>
            {!passed && onRetry && (
              <button
                style={{
                  ...buttonStyle,
                  ...(hoverRetry ? buttonHoverStyle : {}),
                }}
                onMouseEnter={() => setHoverRetry(true)}
                onMouseLeave={() => setHoverRetry(false)}
                onClick={() => {
                  vibrate(50);
                  onRetry();
                }}
              >
                Retry Quiz
              </button>
            )}
            {onContinue && (
              <button
                style={{
                  ...buttonStyle,
                  ...(hoverContinue ? buttonHoverStyle : {}),
                }}
                onMouseEnter={() => setHoverContinue(true)}
                onMouseLeave={() => setHoverContinue(false)}
                onClick={() => {
                  vibrate(50);
                  onContinue();
                }}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

class RewardModal extends React.Component {
  render() {
    return <RewardModalContent {...this.props} />;
  }
}

export default RewardModal;
