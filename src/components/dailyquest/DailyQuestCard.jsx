import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDailyQuestStore } from "../../store/dailyQuestStore";
import DailyQuestExplainerModal from "./DailyQuestExplainerModal";
import DailyQuestCountdown from "./DailyQuestCountdown";
import DailyQuestMascot from "../../assets/mascots/mascot_daily_quest.webp";

export default function DailyQuestCard() {
  const navigate = useNavigate();
  const [showExplainer, setShowExplainer] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const { checkAndGenerateDailyQuest, getQuestStatus, isQuestAvailable } = useDailyQuestStore();

  const questStatus = getQuestStatus();
  const available = isQuestAvailable();

  const handleQuestClick = () => {
    if (questStatus === "completed") {
      return;
    }

    // Only generate new quest if it's a new day, otherwise use existing
    if (questStatus === "new_day") {
      checkAndGenerateDailyQuest();
    }

    if (questStatus === "ready" || questStatus === "new_day") {
      setShowExplainer(true);
    }
  };

  const handleStartQuest = () => {
    setShowExplainer(false);
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    navigate("/daily-quest");
  };

  let buttonText = "Let's Go!";
  let buttonDisabled = false;
  let cardMessage = "Earn XP with today's mini challenge!";

  if (!available) {
    buttonText = "Complete Lessons First";
    buttonDisabled = true;
    cardMessage = "Complete your first lesson to unlock!";
  } else if (questStatus === "completed") {
    buttonText = "Come Back Tomorrow!";
    buttonDisabled = true;
    cardMessage = "You've completed today's quest!";
  }

  return (
    <>
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(0,255,209,0.3), rgba(255,215,0,0.3))",
          borderRadius: 18,
          padding: 16,
          margin: "6px 0 18px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          opacity: buttonDisabled ? 0.7 : 1,
        }}
      >
        <div>
          <h3 style={{ color: "gold", margin: "0 0 6px" }}>Daily Quest</h3>
          <p style={{ margin: 0, color: "#e6f7ff" }}>
            {cardMessage}
          </p>

          <button
            onClick={handleQuestClick}
            disabled={buttonDisabled}
            style={{
              marginTop: 10,
              background: buttonDisabled ? "#6b7280" : "gold",
              border: "none",
              padding: "10px 18px",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: buttonDisabled ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!buttonDisabled) {
                e.currentTarget.style.background = "#ffdd33";
              }
            }}
            onMouseLeave={(e) => {
              if (!buttonDisabled) {
                e.currentTarget.style.background = "gold";
              }
            }}
          >
            {buttonText}
          </button>
        </div>

        <img
          src={DailyQuestMascot}
          alt="Daily Quest Mascot"
          style={{
            width: 90,
            height: "auto",
            marginLeft: 10,
          }}
        />
      </div>

      {showExplainer && (
        <DailyQuestExplainerModal
          onStart={handleStartQuest}
          onCancel={() => setShowExplainer(false)}
        />
      )}
      {showCountdown && (
        <DailyQuestCountdown onComplete={handleCountdownComplete} />
      )}
    </>
  );
}
