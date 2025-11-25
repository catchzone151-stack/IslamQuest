import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../../hooks/useNavigate";
import { useChallengeStore, CHALLENGE_MODES, BOSS_LEVEL, calculateLongestChain } from "../../store/challengeStore";
import { useModalStore, MODAL_TYPES } from "../../store/modalStore";
import { useRewards } from "../../hooks/useRewards";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useVibration } from "../../hooks/useVibration";
import assets from "../../assets/assets";
import mascot_running from "../../assets/mascots/mascot_running.webp";
import { avatarIndexToKey } from "../../utils/avatarUtils";
import "./ChallengeGame.css";

// Helper function to normalize mode from any format to config object
const getModeConfig = (modeInput) => {
  if (!modeInput) return null;
  
  // Already a config object
  if (typeof modeInput === 'object' && modeInput.id) {
    return modeInput;
  }
  
  // String ID (like "mind_battle") - find by ID
  if (typeof modeInput === 'string') {
    // First try: find by ID
    const foundById = Object.values(CHALLENGE_MODES).find(m => m.id === modeInput);
    if (foundById) return foundById;
    
    // Second try: convert to uppercase key and lookup
    const modeKey = modeInput.toUpperCase();
    if (CHALLENGE_MODES[modeKey]) {
      return CHALLENGE_MODES[modeKey];
    }
    
    // Third try: if it's already a key like "MIND_BATTLE"
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
  const { addRewards } = useRewards();
  const analytics = useAnalytics();
  const { vibrate } = useVibration();
  
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
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
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
    
    // Track challenge started for analytics
    if (isBoss) {
      analytics('challenge_started', { mode: 'boss_level' });
    } else if (challenge && mode) {
      analytics('challenge_started', { mode: mode.id, opponent: challenge.opponentId });
    }
    
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
      
      // For Sudden Death with 25 questions or Speed Run with 40, recycle if needed
      if ((mode.id === 'sudden_death' && mode.questionCount) || 
          (mode.id === 'speed_run' && mode.questionCount)) {
        const targetCount = mode.questionCount;
        while (gameQuestions.length < targetCount) {
          // Recycle questions with unique IDs
          const recycledQuestions = challenge.questions.map((q, idx) => ({
            ...q,
            id: `${q.id || idx}_recycled_${Math.floor(gameQuestions.length / challenge.questions.length)}`
          }));
          gameQuestions = [...gameQuestions, ...recycledQuestions];
        }
        gameQuestions = gameQuestions.slice(0, targetCount); // Ensure exact count
      }
      
      setQuestions(gameQuestions);
      // Only set timer for modes with totalTime (Lightning Round, Boss)
      if (mode.totalTime) {
        setTimeLeft(mode.totalTime);
      } else if (mode.timePerQuestion) {
        setTimeLeft(mode.timePerQuestion);
      }
    }
  }, [challengeId, isBoss, navigate, challenge, mode]);

  useEffect(() => {
    // Start countdown timer for modes with totalTime
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

  useEffect(() => {
    // Start elapsed timer for Mind Battle only
    if (questions.length > 0 && mode?.id === 'mind_battle' && !gameEnded) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [questions, gameEnded, mode]);

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
    
    // Haptic feedback for matching
    if (isCorrect) {
      vibrate([100, 50, 100, 50, 100]); // Success pattern
    } else {
      vibrate([200, 100, 200]); // Failure pattern
    }
    
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
    
    vibrate(50); // Quick haptic feedback on answer selection
    setSelectedAnswer(answerIndex);
    selectedAnswerRef.current = answerIndex;

    // For Sudden Death, check if answer is correct
    if (mode?.id === "sudden_death") {
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
      
      // Calculate and update longest chain from all answers
      const longestChain = calculateLongestChain(updatedAnswers);
      setChainLength(longestChain);

      if (!isCorrect) {
        // Chain broken! End game
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

  const handleGameComplete = async (finalAnswers = answers) => {
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
    
    // For Sudden Death, calculate chain length
    const chainLength = mode?.id === 'sudden_death' ? calculateLongestChain(finalAnswers) : null;
    
    console.log('📊 Final score calculated', { finalScore, totalQuestions: questions.length, finalAnswers, chainLength });

    let result = "pending";
    let updatedChallenge = null;

    // Save results locally and apply rewards
    if (isBoss) {
      // Use local boss attempt saving
      const bossResult = useChallengeStore.getState().saveBossAttempt(
        finalScore, 
        finalAnswers, 
        completionTimeRef.current
      );
      
      if (bossResult.success) {
        console.log('✅ Boss attempt saved locally', bossResult);
        
        result = bossResult.attempt?.passed ? "win" : "lose";
        
        useChallengeStore.getState().awardRewards("boss_level", result);
        
        if (result === "win") {
          analytics('boss_win', { score: finalScore, total: BOSS_LEVEL.questionCount });
        }
      } else {
        console.error('❌ Boss save failed:', bossResult.error);
        
        if (bossResult.error === "ALREADY_ATTEMPTED_TODAY") {
          showModal(MODAL_TYPES.ALERT, {
            title: "Already Played Today",
            message: "You've already completed the Boss Level today. Come back tomorrow for another attempt!",
            onClose: () => navigate("/challenge")
          });
          return;
        }
      }
    } else if (challenge) {
      // Use local challenge submission
      const submitResult = useChallengeStore.getState().submitChallengeAttempt(
        challengeId,
        finalScore,
        finalAnswers,
        completionTimeRef.current,
        chainLength
      );
      
      if (submitResult.success) {
        console.log('✅ Challenge attempt submitted locally', submitResult);
        updatedChallenge = submitResult.challenge;
        
        if (updatedChallenge?.status === 'completed') {
          if (updatedChallenge.isDraw) {
            result = "draw";
          } else if (updatedChallenge.winner === 'current_user') {
            result = "win";
          } else {
            result = "lose";
          }
          
          useChallengeStore.getState().awardRewards(updatedChallenge.mode, result);
          
          if (result === "win") {
            analytics('challenge_won', { mode: updatedChallenge.mode, opponent: updatedChallenge.opponentId });
          }
        } else {
          result = "pending";
        }
      } else {
        console.log('⚠️ Challenge submit failed:', submitResult.error);
        result = "pending";
      }
    }

    // Use the mode from component scope (already normalized)
    console.log('🎯 Using mode for rewards', { mode, result });
    
    if (!mode) {
      console.error('❌ Mode is undefined! Cannot show results.');
      return;
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
    
    // For Speed Run, track how many questions were actually answered
    const isSpeedRun = mode?.id === "speed_run";
    const userAnsweredCount = isSpeedRun ? finalAnswers.length : questions.length;
    const opponentAnsweredCount = isSpeedRun && challenge?.opponentAnswers ? challenge.opponentAnswers.length : questions.length;
    
    // For Sudden Death, get chain lengths (recalculate from answers to ensure accuracy)
    const isSuddenDeath = mode?.id === "sudden_death";
    const userChain = isSuddenDeath ? calculateLongestChain(finalAnswers) : null;
    const opponentChain = isSuddenDeath 
      ? (challenge?.opponentAnswers ? calculateLongestChain(challenge.opponentAnswers) : null)
      : null;
    
    showModal(MODAL_TYPES.CHALLENGE_RESULTS, {
      mode,
      score: finalScore,
      totalQuestions: questions.length,
      answeredCount: userAnsweredCount,
      opponentAnsweredCount: opponentAnsweredCount,
      result,
      rewards,
      xpEarned: rewards.xp,
      coinsEarned: rewards.coins,
      opponentName: isBoss ? "Boss" : challenge?.opponentId,
      opponentScore: challenge?.opponentScore,
      userChain,
      opponentChain,
      onApplyRewards: (rewardData) => addRewards(rewardData),
      onClose: () => navigate("/challenge")
    });
  };

  if (questions.length === 0) {
    return (
      <div className="screen no-extra-space challenge-game-container">
        <div className="challenge-loading">Loading questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="screen no-extra-space challenge-game-container">
      {/* Header */}
      <div className="challenge-game-header">
        <div className="challenge-game-title">
          {mode?.id === "speed_run" ? (
            <img 
              src={mascot_running} 
              alt="Speed Run" 
              style={{ width: "40px", height: "auto" }}
            />
          ) : (
            <span style={{ fontSize: "1.5rem" }}>{mode?.icon}</span>
          )}
          <span>{mode?.name}</span>
        </div>
        {/* Countdown timer for modes with totalTime (Lightning Round, Boss, Speed Run) */}
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
        {/* Elapsed timer for Mind Battle only */}
        {mode?.id === 'mind_battle' && (
          <div 
            className="challenge-game-timer"
            style={{
              color: "#8b5cf6"
            }}
          >
            🕐 {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="challenge-progress-container">
        <div className="challenge-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="challenge-progress-text">
        {mode?.id === "speed_run" ? `Question ${currentIndex + 1}` : `Question ${currentIndex + 1} of ${questions.length}`}
      </p>

      {/* Thinking Mascot - Show opponent's avatar for friend challenges, boss mascot for boss */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img 
          src={
            isBoss 
              ? assets.mascots.mascot_pointing_v2 
              : (challenge?.opponentAvatar ? assets.avatars[challenge.opponentAvatar] : assets.mascots.mascot_pointing_v2)
          }
          alt={isBoss ? "Boss" : "Opponent"}
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

        {/* Chain Length Display (Sudden Death only) */}
        {mode?.id === "sudden_death" && answers.length > 0 && (
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
