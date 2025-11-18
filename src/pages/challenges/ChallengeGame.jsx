import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../../hooks/useNavigate";
import { useChallengeStore, CHALLENGE_MODES, BOSS_LEVEL } from "../../store/challengeStore";
import { useProgressStore } from "../../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../../store/modalStore";
import assets from "../../assets/assets";
import "./ChallengeGame.css";

// Helper function to normalize mode from any format to config object
const getModeConfig = (modeInput) => {
  if (!modeInput) return null;
  
  // Already a config object
  if (typeof modeInput === 'object' && modeInput.id) {
    return modeInput;
  }
  
  // String ID (like "mind_duel") - find by ID
  if (typeof modeInput === 'string') {
    // First try: find by ID
    const foundById = Object.values(CHALLENGE_MODES).find(m => m.id === modeInput);
    if (foundById) return foundById;
    
    // Second try: convert to uppercase key and lookup
    const modeKey = modeInput.toUpperCase();
    if (CHALLENGE_MODES[modeKey]) {
      return CHALLENGE_MODES[modeKey];
    }
    
    // Third try: if it's already a key like "MIND_DUEL"
    if (CHALLENGE_MODES[modeInput]) {
      return CHALLENGE_MODES[modeInput];
    }
  }
  
  console.error('Failed to normalize mode:', modeInput);
  return null;
};

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
  const [textInput, setTextInput] = useState("");
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]);
  
  const timerRef = useRef(null);
  const selectedAnswerRef = useRef(null);
  const isCompletingRef = useRef(false);
  const startTimeRef = useRef(null);
  const completionTimeRef = useRef(null);

  // Determine if it's a boss level or friend challenge
  const isBoss = challengeId === "boss";
  
  // For friend challenges, get the challenge data (use useMemo to prevent infinite loop)
  const { challenges } = useChallengeStore();
  const challenge = useMemo(() => 
    isBoss ? null : challenges.find(c => c.id === challengeId),
    [isBoss, challenges, challengeId]
  );
  
  // Get mode configuration using robust normalization
  const mode = useMemo(() => {
    if (isBoss) return BOSS_LEVEL;
    if (challenge) return getModeConfig(challenge.mode);
    return null;
  }, [isBoss, challenge]);

  useEffect(() => {
    console.log('🎮 Loading challenge questions', { isBoss, challengeId, mode });
    
    // Start tracking time when game begins
    startTimeRef.current = Date.now();
    
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
    } else if (challenge && mode) {
      let gameQuestions = [...challenge.questions];
      
      // For Lightning Chain with 25 questions, recycle if needed
      if (mode.id === 'lightning_chain' && mode.questionCount === 25) {
        while (gameQuestions.length < 25) {
          // Recycle questions with slight rewording by adding index
          const recycledQuestions = challenge.questions.map((q, idx) => ({
            ...q,
            id: `${q.id || idx}_recycled_${Math.floor(gameQuestions.length / challenge.questions.length)}`
          }));
          gameQuestions = [...gameQuestions, ...recycledQuestions];
        }
        gameQuestions = gameQuestions.slice(0, 25); // Ensure exactly 25
      }
      
      setQuestions(gameQuestions);
      // Only set timer for modes with totalTime (Lightning Round, Boss)
      if (mode.totalTime) {
        setTimeLeft(mode.totalTime);
      } else if (mode.timePerQuestion) {
        setTimeLeft(mode.timePerQuestion);
      }
    }
  }, [challengeId, isBoss, navigate]);

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

  const handleMatchSelect = (side, index) => {
    if (selectedAnswer !== null || gameEnded) return;
    
    if (side === 'left') {
      if (selectedLeft === index) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(index);
        // Auto-check if both sides selected
        if (selectedRight !== null) {
          checkMatch(index, selectedRight);
        }
      }
    } else {
      if (selectedRight === index) {
        setSelectedRight(null);
      } else {
        setSelectedRight(index);
        // Auto-check if both sides selected
        if (selectedLeft !== null) {
          checkMatch(selectedLeft, index);
        }
      }
    }
  };

  const checkMatch = (leftIdx, rightIdx) => {
    const currentQ = questions[currentIndex];
    const isCorrect = rightIdx === currentQ.answer;
    
    setMatches([...matches, { left: leftIdx, right: rightIdx, correct: isCorrect }]);
    setSelectedAnswer(isCorrect ? rightIdx : -1);
    
    const newAnswer = {
      questionId: currentQ.id || currentIndex,
      selectedAnswer: rightIdx,
      correct: isCorrect
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatches([]);
        if (mode?.timePerQuestion) {
          setTimeLeft(mode.timePerQuestion);
        }
      } else {
        setGameEnded(true);
        setTimeout(() => handleGameComplete(updatedAnswers), 1000);
      }
    }, 1500);
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

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      if (!isCorrect) {
        // Chain broken!
        setChainLength(updatedAnswers.length);
        setGameEnded(true);
        setTimeout(() => handleGameComplete(updatedAnswers), 1500);
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
            setChainLength(updatedAnswers.length);
            setGameEnded(true);
            setTimeout(() => handleGameComplete(updatedAnswers), 1500);
          }
        }, 800);
      }
    } else if (mode?.id === "speed_run") {
      // Speed Run - Continue immediately, wrong answers don't end game
      setTimeout(() => handleNextQuestion(), 200);
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

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      selectedAnswerRef.current = null;

      // Reset timer for per-question modes
      if (mode?.timePerQuestion && mode?.id !== "lightning_round") {
        setTimeLeft(mode.timePerQuestion);
      }
    } else {
      // Last question answered - pass complete answers to handleGameComplete
      setGameEnded(true);
      setTimeout(() => handleGameComplete(updatedAnswers), 1000);
    }
  };

  const handleGameComplete = (finalAnswers = answers) => {
    // Prevent double-completion
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setGameEnded(true);
    
    // Calculate completion time
    if (startTimeRef.current) {
      completionTimeRef.current = (Date.now() - startTimeRef.current) / 1000; // in seconds
    }
    
    console.log('🏁 handleGameComplete called', { isBoss, mode, challenge, finalAnswers, completionTime: completionTimeRef.current });
    
    // Calculate final score from passed-in answers (includes last answer)
    const finalScore = finalAnswers.filter(a => a.correct).length;
    setScore(finalScore);
    
    console.log('📊 Final score calculated', { finalScore, totalQuestions: questions.length, finalAnswers });

    // Save results and award rewards
    if (isBoss) {
      useChallengeStore.getState().saveBossAttempt(finalScore, finalAnswers);
      const result = finalScore >= BOSS_LEVEL.questionCount * 0.6 ? "win" : "lose";
      useChallengeStore.getState().awardRewards("boss_level", result);
    } else if (challenge) {
      const currentUserId = "current_user";
      const isChallenger = challenge.challengerId === currentUserId;
      useChallengeStore.getState().saveChallengeProgress(
        challengeId, 
        finalScore, 
        finalAnswers, 
        isChallenger, 
        completionTimeRef.current
      );
      
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

    // Use the mode from component scope (already normalized)
    console.log('🎯 Using mode for rewards', { mode });
    
    if (!mode) {
      console.error('❌ Mode is undefined! Cannot show results.');
      return;
    }
    
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
    
    console.log('🏆 Result determined', { result, mode, rewards: mode?.rewards });
    
    // Calculate rewards safely - handle "pending" result
    let rewards = { xp: 0, coins: 0 };
    if (mode?.rewards) {
      if (result && mode.rewards[result]) {
        rewards = mode.rewards[result];
      } else if (mode.rewards.lose) {
        rewards = mode.rewards.lose;
      }
    }
    
    console.log('💰 Showing results modal', { finalScore, result, rewards });
    
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
        {/* Only show timer for modes with totalTime (Lightning Round, Boss) - NOT Mind Duel */}
        {mode?.totalTime && (
          <div 
            className="challenge-game-timer"
            style={{
              color: timeLeft <= 10 ? "#ef4444" : "#10b981"
            }}
          >
            ⏱️ {timeLeft}s
          </div>
        )}
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
        
        {/* MCQ Options */}
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
