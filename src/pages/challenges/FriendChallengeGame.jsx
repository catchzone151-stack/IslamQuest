import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../../hooks/useNavigate";
import { useFriendChallengesStore } from "../../store/friendChallengesStore";
import { CHALLENGE_MODES, calculateLongestChain } from "../../store/challengeStore";
import { useModalStore, MODAL_TYPES } from "../../store/modalStore";
import { useRewards } from "../../hooks/useRewards";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useVibration } from "../../hooks/useVibration";
import { useFriendsStore } from "../../store/friendsStore";
import { useUserStore } from "../../store/useUserStore";
import assets from "../../assets/assets";
import mascot_running from "../../assets/mascots/mascot_running.webp";
import { getAvatarImage } from "../../utils/avatarUtils";
import "./ChallengeGame.css";

const getModeConfig = (modeId) => {
  if (!modeId) return null;
  if (typeof modeId === 'object' && modeId.id) return modeId;
  if (typeof modeId === 'string') {
    const foundById = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
    if (foundById) return foundById;
    const modeKey = modeId.toUpperCase();
    if (CHALLENGE_MODES[modeKey]) return CHALLENGE_MODES[modeKey];
    if (CHALLENGE_MODES[modeId]) return CHALLENGE_MODES[modeId];
  }
  console.error('Failed to normalize mode:', modeId);
  return null;
};

export default function FriendChallengeGame() {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const { showModal } = useModalStore();
  const { addRewards } = useRewards();
  const analytics = useAnalytics();
  const { vibrate } = useVibration();
  const { id: currentUserId } = useUserStore();
  const { getAllFriends } = useFriendsStore();
  
  const submitResult = useFriendChallengesStore(state => state.submitResult);
  const determineWinner = useFriendChallengesStore(state => state.determineWinner);
  const getRewards = useFriendChallengesStore(state => state.getRewards);
  const markResultViewed = useFriendChallengesStore(state => state.markResultViewed);
  const ensureChallengeLoaded = useFriendChallengesStore(state => state.ensureChallengeLoaded);
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState(0);
  const [chainLength, setChainLength] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [isSender, setIsSender] = useState(false);
  
  const timerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const selectedAnswerRef = useRef(null);
  const isCompletingRef = useRef(false);
  const startTimeRef = useRef(null);
  const completionTimeRef = useRef(null);

  const mode = challenge ? getModeConfig(challenge.challenge_type) : null;

  useEffect(() => {
    let isMounted = true;
    
    const loadChallenge = async () => {
      console.log('[FriendChallengeGame] Loading challenge:', challengeId);
      
      const loadedChallenge = await ensureChallengeLoaded(challengeId);
      
      if (!isMounted) return;
      
      if (!loadedChallenge) {
        console.error('[FriendChallengeGame] Challenge not found:', challengeId);
        showModal(MODAL_TYPES.ERROR, {
          title: "Challenge Not Found",
          message: "This challenge could not be loaded. It may have expired.",
          onClose: () => navigate("/challenge")
        });
        return;
      }
      
      console.log('[FriendChallengeGame] Challenge loaded:', loadedChallenge.id);
      setChallenge(loadedChallenge);
      setIsSender(loadedChallenge.sender_id === currentUserId);
      setLoading(false);
    };
    
    loadChallenge();
    
    return () => {
      isMounted = false;
    };
  }, [challengeId, currentUserId, ensureChallengeLoaded, showModal, navigate]);

  useEffect(() => {
    if (loading || gameInitialized || !challenge) return;
    
    const amSender = challenge.sender_id === currentUserId;
    const alreadyPlayed = amSender 
      ? challenge.sender_score !== null
      : challenge.receiver_score !== null;
    
    if (alreadyPlayed) {
      showModal(MODAL_TYPES.ALERT, {
        title: "Already Played",
        message: "You've already completed this challenge! Waiting for your friend to finish.",
        onClose: () => navigate("/challenge")
      });
      return;
    }
    
    const opponentId = amSender ? challenge.receiver_id : challenge.sender_id;
    const friends = getAllFriends();
    const friend = friends.find(f => (f.user_id || f.id) === opponentId);
    if (friend) {
      setOpponentInfo({
        name: friend.nickname || friend.username || "Friend",
        avatar: friend.avatar,
      });
    }
    
    const challengeQuestions = challenge.questions || [];
    if (challengeQuestions.length === 0) {
      console.error('[FriendChallengeGame] No questions in challenge');
      showModal(MODAL_TYPES.ERROR, {
        title: "No Questions",
        message: "This challenge has no questions.",
        onClose: () => navigate("/challenge")
      });
      return;
    }
    
    const modeConfig = getModeConfig(challenge.challenge_type);
    let gameQuestions = [...challengeQuestions];
    
    if ((modeConfig?.id === 'sudden_death' && modeConfig.questionCount) || 
        (modeConfig?.id === 'speed_run' && modeConfig.questionCount)) {
      const targetCount = modeConfig.questionCount;
      while (gameQuestions.length < targetCount) {
        const recycledQuestions = challengeQuestions.map((q, idx) => ({
          ...q,
          id: `${q.id || idx}_recycled_${Math.floor(gameQuestions.length / challengeQuestions.length)}`
        }));
        gameQuestions = [...gameQuestions, ...recycledQuestions];
      }
      gameQuestions = gameQuestions.slice(0, targetCount);
    }
    
    setQuestions(gameQuestions);
    
    if (modeConfig?.totalTime) {
      setTimeLeft(modeConfig.totalTime);
    } else if (modeConfig?.timePerQuestion) {
      setTimeLeft(modeConfig.timePerQuestion);
    }
    
    startTimeRef.current = Date.now();
    setGameInitialized(true);
    
    analytics('friend_challenge_started', { 
      mode: modeConfig?.id, 
      challengeId,
      opponentId 
    });
    
    console.log('[FriendChallengeGame] Loaded challenge:', {
      id: challengeId,
      mode: modeConfig?.id,
      questionCount: gameQuestions.length,
      isSender: amSender
    });
  }, [loading, challengeId, currentUserId, challenge, getAllFriends, analytics, showModal, navigate]);

  useEffect(() => {
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
    
    setTimeout(() => {
      handleGameComplete();
    }, 1000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || gameEnded) return;
    
    vibrate(50);
    setSelectedAnswer(answerIndex);
    selectedAnswerRef.current = answerIndex;

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
      
      const longestChain = calculateLongestChain(updatedAnswers);
      setChainLength(longestChain);

      if (!isCorrect) {
        setGameEnded(true);
        setTimeout(() => handleGameComplete(updatedAnswers), 1500);
      } else {
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            selectedAnswerRef.current = null;
            if (mode.timePerQuestion) {
              setTimeLeft(mode.timePerQuestion);
            }
          } else {
            setGameEnded(true);
            setTimeout(() => handleGameComplete(updatedAnswers), 1500);
          }
        }, 800);
      }
    } else if (mode?.id === "speed_run") {
      setTimeout(() => handleNextQuestion(), 200);
    } else {
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

      if (mode?.timePerQuestion && mode?.id !== "lightning_round") {
        setTimeLeft(mode.timePerQuestion);
      }
    } else {
      setGameEnded(true);
      setTimeout(() => handleGameComplete(updatedAnswers), 1000);
    }
  };

  const handleGameComplete = async (finalAnswers = answers) => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setGameEnded(true);
    
    if (startTimeRef.current) {
      completionTimeRef.current = (Date.now() - startTimeRef.current) / 1000;
    }
    
    const finalScore = finalAnswers.filter(a => a.correct).length;
    setScore(finalScore);
    
    const chainLengthResult = mode?.id === 'sudden_death' ? calculateLongestChain(finalAnswers) : null;
    
    console.log('[FriendChallengeGame] Submitting result:', {
      challengeId,
      score: finalScore,
      completionTime: completionTimeRef.current,
      chain: chainLengthResult
    });
    
    const submitResultResponse = await submitResult(
      challengeId,
      finalScore,
      finalAnswers,
      completionTimeRef.current,
      chainLengthResult
    );
    
    console.log('[FriendChallengeGame] Submit response:', submitResultResponse);
    
    if (!submitResultResponse.success) {
      console.error('[FriendChallengeGame] Submit failed:', submitResultResponse.error);
      showModal(MODAL_TYPES.ERROR, {
        title: "Error",
        message: "Failed to save your results. Please try again.",
        onClose: () => navigate("/challenge")
      });
      return;
    }
    
    const updatedChallenge = submitResultResponse.challenge;
    console.log('[FriendChallengeGame] Updated challenge status:', updatedChallenge?.status);
    
    if (updatedChallenge?.status === 'finished') {
      const winnerId = determineWinner(updatedChallenge);
      const rewards = getRewards(updatedChallenge, winnerId);
      
      let result = "draw";
      if (winnerId !== "draw") {
        result = winnerId === currentUserId ? "win" : "lose";
      }
      
      if (rewards.xp > 0 || rewards.coins > 0) {
        addRewards(rewards);
      }
      
      analytics('friend_challenge_completed', {
        mode: mode?.id,
        result,
        score: finalScore,
        challengeId
      });
      
      showModal(MODAL_TYPES.FRIEND_CHALLENGE_RESULTS, {
        challenge: updatedChallenge,
        currentUserId,
        userScore: finalScore,
        opponentInfo,
        onChallengeAgain: () => {
          markResultViewed(challengeId);
          navigate("/challenge", {
            state: {
              preselectedFriend: opponentInfo ? {
                id: isSender ? updatedChallenge.receiver_id : updatedChallenge.sender_id,
                user_id: isSender ? updatedChallenge.receiver_id : updatedChallenge.sender_id,
                name: opponentInfo.name,
                avatar: opponentInfo.avatar,
              } : null,
            }
          });
        },
        onClose: () => {
          markResultViewed(challengeId);
          navigate("/challenge");
        }
      });
    } else {
      console.log('[FriendChallengeGame] Showing waiting modal');
      showModal(MODAL_TYPES.FRIEND_CHALLENGE_WAITING, {
        friendName: opponentInfo?.name || "Your friend",
        modeId: mode?.id,
        score: finalScore,
        totalQuestions: questions.length,
        challengeId: challengeId,
        onClose: () => navigate("/challenge")
      });
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="screen no-extra-space challenge-game-container">
        <div className="challenge-loading">Loading challenge...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const opponentAvatarSrc = opponentInfo?.avatar 
    ? getAvatarImage(opponentInfo.avatar, { nickname: opponentInfo.name })
    : assets.mascots.mascot_pointing_v2;

  return (
    <div className="screen no-extra-space challenge-game-container">
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

      <div className="challenge-progress-container">
        <div className="challenge-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="challenge-progress-text">
        {mode?.id === "speed_run" ? `Question ${currentIndex + 1}` : `Question ${currentIndex + 1} of ${questions.length}`}
      </p>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <img 
            src={opponentAvatarSrc}
            alt={opponentInfo?.name || "Opponent"}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "contain",
              borderRadius: "50%",
              border: "3px solid #D4AF37"
            }}
          />
          {opponentInfo?.name && (
            <div style={{
              marginTop: "8px",
              fontSize: "0.85rem",
              color: "#D4AF37",
              fontWeight: "600"
            }}>
              vs {opponentInfo.name}
            </div>
          )}
        </div>
      </div>

      <div className="challenge-question-card">
        <h2 className="challenge-question-text">{currentQuestion.question}</h2>
        
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

        {mode?.id === "sudden_death" && answers.length > 0 && (
          <div className="chain-display">
            <span>Chain: {answers.length}</span>
            <span>🔥</span>
          </div>
        )}
      </div>

      {isTimeUp && (
        <div className="challenge-time-up-overlay">
          <div className="time-up-message">⏰ Time's Up!</div>
        </div>
      )}
    </div>
  );
}
