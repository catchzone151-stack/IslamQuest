// src/components/quiz/RewardModal.jsx

import React from "react";
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

class RewardModal extends React.Component {
  state = {
    hoverContinue: false,
    hoverRetry: false,
  };

  render() {
    const { score, totalQ, xp, coins, mascotImg, onContinue, onRetry, passed } = this.props;

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
            <img src={mascotImg} alt="Zayd" style={mascotStyle} />

            <h2 style={titleStyle}>
              {passed ? "MASHAA ALLAH!" : "Try Again!"}
            </h2>
            <p style={messageStyle}>
              {passed 
                ? "You unlocked the next lesson!" 
                : "You need at least 3 correct answers to unlock the next lesson."}
            </p>

            <div style={{...messageStyle, fontSize: "18px", fontWeight: 700, color: "#FACC15", marginBottom: "12px"}}>
              Score: {score}/{totalQ}
            </div>

            {passed && (
              <div style={rewardsRowStyle}>
                <div style={rewardItemStyle}>
                  <img src={xpIcon} alt="XP" style={iconStyle} />
                  <span>+{xp}</span>
                </div>
                <div style={rewardItemStyle}>
                  <img src={coinIcon} alt="Coins" style={iconStyle} />
                  <span>+{coins}</span>
                </div>
              </div>
            )}

            <div style={{display: "flex", gap: "12px", justifyContent: "center"}}>
              {!passed && onRetry && (
                <button
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#10B981",
                    ...(this.state.hoverRetry ? {...buttonHoverStyle, backgroundColor: "#34D399"} : {}),
                  }}
                  onMouseEnter={() => this.setState({ hoverRetry: true })}
                  onMouseLeave={() => this.setState({ hoverRetry: false })}
                  onClick={onRetry}
                >
                  Try Again
                </button>
              )}
              
              <button
                style={{
                  ...buttonStyle,
                  ...(this.state.hoverContinue ? buttonHoverStyle : {}),
                }}
                onMouseEnter={() => this.setState({ hoverContinue: true })}
                onMouseLeave={() => this.setState({ hoverContinue: false })}
                onClick={onContinue}
              >
                {passed ? "Continue Learning →" : "Back to Path"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default RewardModal;
