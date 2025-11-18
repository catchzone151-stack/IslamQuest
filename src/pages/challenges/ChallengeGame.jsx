import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../../hooks/useNavigate";
import { useChallengeStore, CHALLENGE_MODES, BOSS_LEVEL } from "../../store/challengeStore";
import { useProgressStore } from "../../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../../store/modalStore";
import assets from "../../assets/assets";
import "./ChallengeGame.css";

export default function ChallengeGame() {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const { showModal } = useModalStore();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState(0);
  const [chainLength, setChainLength] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  
  const timerRef = useRef(null);
  const selectedAnswerRef = useRef(null);

  // Determine if it's a boss level or friend challenge
  const isBoss = challengeId === "boss";
  
  // For friend challenges, get the challenge data
  const { challenges } = useChallengeStore();
  const challenge = isBoss ? null : challenges.find(c => c.id === challengeId);
  
  // Get mode configuration
  let mode;
  if (isBoss) {
    mode = BOSS_LEVEL;
  } else if (challenge) {
    // Convert mode string to proper key (mind_duel -> MIND_DUEL)
    const modeKey = challenge.mode.toUpperCase();
    mode = CHALLENGE_MODES[modeKey];
  }

  useEffect(() => {
    // Load questions based on challenge type
    if (isBoss) {
      const bossQuestions = useChallengeStore.getState().getBossLevelQuestions();
      if (bossQuestions.length === 0) {
        alert("Complete some lessons first to unlock Boss Level questions!");
        navigate("/challenge");
        return;
      }
      setQuestions(bossQuestions);
      setTimeLeft(BOSS_LEVEL.totalTime);
    } else if (challenge) {
      setQuestions(challenge.questions);
      const config = CHALLENGE_MODES[challenge.mode.toUpperCase()];
      if (config.totalTime) {
        setTimeLeft(config.totalTime);
      } else if (config.timePerQuestion) {
        setTimeLeft(config.timePerQuestion);
      }
    }
  }, [challengeId, isBoss, challenge, navigate]);

  useEffect(() => {
    // Start timer
    if (questions.length > 0 && timeLeft > 0 && !gameEnded) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, timeLeft, gameEnded]);

  const handleTimeUp = () => {
    setIsTimeUp(true);
    setGameEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Auto-submit with current answers
    setTimeout(() => {
      handleGameComplete();
    }, 1000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || gameEnded) return;
    
    setSelectedAnswer(answerIndex);
    selectedAnswerRef.current = answerIndex;

    // For Lightning Chain, check if answer is correct
    if (mode?.id === "lightning_chain") {
      const currentQ = questions[currentIndex];
      const correctAnswer = currentQ.answer ?? currentQ.correctIndex ?? currentQ.correct;
      const isCorrect = answerIndex === correctAnswer;
      
      const newAnswer = {
        questionId: questions[currentIndex].id || currentIndex,
        selectedAnswer: answerIndex,
        correct: isCorrect
      };

      setAnswers(prev => [...prev, newAnswer]);

      if (!isCorrect) {
        // Chain broken!
        setChainLength(answers.length);
        setGameEnded(true);
        setTimeout(() => handleGameComplete(), 1500);
      } else {
        // Continue chain
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            selectedAnswerRef.current = null;
            if (mode.timePerQuestion) {
              setTimeLeft(mode.timePerQuestion);
            }
          } else {
            // Completed all questions successfully!
            setChainLength(answers.length + 1);
            setGameEnded(true);
            setTimeout(() => handleGameComplete(), 1500);
          }
        }, 800);
      }
    } else {
      // Regular modes
      setTimeout(() => handleNextQuestion(), 800);
    }
  };

  const handleNextQuestion = () => {
    const answerIndex = selectedAnswerRef.current;
    if (answerIndex === null) return;

    const currentQ = questions[currentIndex];
    const correctAnswer = currentQ.answer ?? currentQ.correctIndex ?? currentQ.correct;
    const isCorrect = answerIndex === correctAnswer;
    const newAnswer = {
      questionId: questions[currentIndex].id || currentIndex,
      selectedAnswer: answerIndex,
      correct: isCorrect
    };

    setAnswers(prev => [...prev, newAnswer]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      selectedAnswerRef.current = null;

      // Reset timer for per-question modes
      if (mode?.timePerQuestion && mode?.id !== "lightning_round") {
        setTimeLeft(mode.timePerQuestion);
      }
    } else {
      // Last question answered
      setGameEnded(true);
      setTimeout(() => handleGameComplete(), 1000);
    }
  };

  const handleGameComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const finalScore = answers.filter(a => a.correct).length;
    setScore(finalScore);

    // Save results and award rewards
    if (isBoss) {
      useChallengeStore.getState().saveBossAttempt(finalScore, answers);
      const result = finalScore >= BOSS_LEVEL.questionCount * 0.6 ? "win" : "lose";
      useChallengeStore.getState().awardRewards("boss_level", result);
    } else if (challenge) {
      const currentUserId = "current_user";
      const isChallenger = challenge.challengerId === currentUserId;
      useChallengeStore.getState().saveChallengeProgress(challengeId, finalScore, answers, isChallenger);
      
      // Re-read the updated challenge from store to check if both players finished
      const updatedChallenge = useChallengeStore.getState().challenges.find(c => c.id === challengeId);
      if (updatedChallenge && updatedChallenge.challengerScore !== null && updatedChallenge.opponentScore !== null) {
        // Both players finished - complete the challenge and award rewards
        const winner = useChallengeStore.getState().completeChallenge(challengeId);
        let rewardType = "lose";
        if (winner === "draw") {
          rewardType = "draw";
        } else if ((winner === updatedChallenge.challengerId && isChallenger) || 
                   (winner === updatedChallenge.opponentId && !isChallenger)) {
          rewardType = "win";
        }
        useChallengeStore.getState().awardRewards(updatedChallenge.mode, rewardType);
      }
    }

    // Calculate rewards WITHOUT awarding them (already awarded above)
    const config = isBoss ? BOSS_LEVEL : (challenge && CHALLENGE_MODES[challenge.mode.toUpperCase()]);
    let result;
    
    if (isBoss) {
      result = finalScore >= BOSS_LEVEL.questionCount * 0.6 ? "win" : "lose";
    } else if (challenge) {
      // Re-read challenge to get final winner status
      const updatedChallenge = useChallengeStore.getState().challenges.find(c => c.id === challengeId);
      const currentUserId = "current_user";
      const isChallenger = challenge.challengerId === currentUserId;
      
      if (updatedChallenge?.winner) {
        if (updatedChallenge.winner === "draw") {
          result = "draw";
        } else if ((updatedChallenge.winner === updatedChallenge.challengerId && isChallenger) ||
                   (updatedChallenge.winner === updatedChallenge.opponentId && !isChallenger)) {
          result = "win";
        } else {
          result = "lose";
        }
      } else {
        // Game not completed yet (waiting for opponent)
        result = "pending";
      }
    }
    
    const rewards = config?.rewards[result] || config?.rewards.lose || { xp: 0, coins: 0 };
    
    showModal(MODAL_TYPES.CHALLENGE_RESULTS, {
      mode,
      score: finalScore,
      totalQuestions: questions.length,
      result,
      rewards,
      opponentName: isBoss ? "Boss" : challenge?.opponentId,
      opponentScore: challenge?.opponentScore,
      onClose: () => navigate("/challenge")
    });
  };

  if (questions.length === 0) {
    return (
      <div className="challenge-game-container">
        <div className="challenge-loading">Loading questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="challenge-game-container">
      {/* Header */}
      <div className="challenge-game-header">
        <div className="challenge-game-title">
          <span style={{ fontSize: "1.5rem" }}>{mode?.icon}</span>
          <span>{mode?.name}</span>
        </div>
        <div 
          className="challenge-game-timer"
          style={{
            color: timeLeft <= 10 ? "#ef4444" : "#10b981"
          }}
        >
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Progress Bar */}
      <div className="challenge-progress-container">
        <div className="challenge-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="challenge-progress-text">
        Question {currentIndex + 1} of {questions.length}
      </p>

      {/* Thinking Mascot */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img 
          src={assets.mascots.mascot_dua} 
          alt="Mascot"
          style={{
            width: "80px",
            height: "auto"
          }}
        />
      </div>

      {/* Question Card */}
      <div className="challenge-question-card">
        <h2 className="challenge-question-text">{currentQuestion.question}</h2>
        
        {/* Answer Options */}
<div className="challenge-options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const correctAnswerIndex = currentQuestion.answer ?? currentQuestion.correctIndex ?? currentQuestion.correct;
            const isCorrect = index === correctAnswerIndex;
            const showResult = selectedAnswer !== null;

            return (
              <button
                key={index}
                className={`challenge-option ${isSelected ? 'selected' : ''} ${
                  showResult && isSelected && isCorrect ? 'correct' : ''
                } ${showResult && isSelected && !isCorrect ? 'wrong' : ''}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                style={{
                  borderColor: isSelected ? (showResult && isCorrect ? '#10b981' : showResult && !isCorrect ? '#ef4444' : '#d4af37') : 'rgba(255,255,255,0.2)'
                }}
              >
                {option}
                {showResult && isSelected && isCorrect && <span className="option-icon">✓</span>}
                {showResult && isSelected && !isCorrect && <span className="option-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Chain Length Display (Lightning Chain only) */}
        {mode?.id === "lightning_chain" && answers.length > 0 && (
          <div className="chain-display">
            <span>Chain: {answers.length}</span>
            <span>🔥</span>
          </div>
        )}
      </div>

      {/* Time Up Overlay */}
      {isTimeUp && (
        <div className="challenge-time-up-overlay">
          <div className="time-up-message">⏰ Time's Up!</div>
        </div>
      )}
    </div>
  );
}
