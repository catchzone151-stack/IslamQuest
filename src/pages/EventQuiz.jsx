import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { useEventsStore } from "../store/eventsStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { useVibration } from "../hooks/useVibration";
import { getEventQuestions } from "../data/eventQuestions";
import PointingMascot from "../assets/mascots/mascot_pointing_v2.webp";
import "./EventQuiz.css";

export default function EventQuiz() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEvents, enterEvent, hasEntered } = useEventsStore();
  const { coins, removeCoins } = useProgressStore();
  const { showModal } = useModalStore();
  const { vibrate } = useVibration();
  
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds total
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const autoAdvanceTimeoutRef = React.useRef(null);
  const selectedAnswerRef = React.useRef(null);

  // Redirect if invalid event
  useEffect(() => {
    if (!event) {
      navigate("/events");
      return;
    }
  }, [event, navigate]);

  // Show info modal on mount
  useEffect(() => {
    if (event) {
      showModal(MODAL_TYPES.EVENT_INFO, {
        event,
        onStart: handleStartQuiz,
        onCancel: () => navigate("/events")
      });
    }
  }, []);

  // No longer needed - coins checked in handleStartQuiz before countdown

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up! Auto-submit with current answers
          // Build final answer if one is selected
          let finalAnswers = [...userAnswers];
          if (selectedAnswerRef.current !== null) {
            const isCorrect = selectedAnswerRef.current === questions[currentQuestionIndex].correct;
            finalAnswers.push({
              questionId: questions[currentQuestionIndex].id,
              selectedAnswer: selectedAnswerRef.current,
              correct: isCorrect
            });
          }
          handleQuizComplete(finalAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, userAnswers, questions, currentQuestionIndex]);

  const handleStartQuiz = () => {
    // Pre-countdown validation: Check coins to prevent wasted countdown
    if (coins < 25) {
      alert("You need 25 coins to enter this event!");
      navigate("/events");
      return;
    }
    
    // Start countdown
    showModal(MODAL_TYPES.EVENT_COUNTDOWN, {
      onComplete: handleCountdownComplete
    });
  };

  const handleCountdownComplete = () => {
    // Critical validations AFTER countdown but BEFORE quiz starts
    // This ensures atomicity: if checks fail, no coins lost
    // Prevent duplicate entries and coin deductions
    if (hasEntered(eventId)) {
      alert("You've already entered this event!");
      navigate("/events");
      return;
    }
    
    // Load questions FIRST to validate
    const eventQuestions = getEventQuestions(eventId, 10);
    
    if (!eventQuestions || eventQuestions.length === 0) {
      alert("Error loading quiz questions. Please try again.");
      navigate("/events");
      return;
    }
    
    // Deduct coins ONLY after confirming questions loaded
    const success = removeCoins(25);
    if (!success) {
      alert("You don't have enough coins! You need 25 coins to enter.");
      navigate("/events");
      return;
    }
    
    // Start quiz FIRST (atomic with coin deduction)
    setQuestions(eventQuestions);
    setQuizStarted(true);
    
    // Record entry IMMEDIATELY after quiz starts (transactional integrity)
    // This prevents coin loss if user refreshes during quiz
    // Entry will be updated with final score when quiz completes
    enterEvent(eventId, 0, []);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || isCompleting) return; // Prevent double-selection
    
    setSelectedAnswer(answerIndex);
    selectedAnswerRef.current = answerIndex; // Store in ref for timeout closure
    
    // Auto-advance after 500ms for better UX
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 500);
  };

  const handleNextQuestion = () => {
    const answer = selectedAnswerRef.current;
    if (answer === null || isCompleting) return; // Safety check using ref
    
    // Clear any pending auto-advance
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    // Build new answer entry
    const isCorrect = answer === questions[currentQuestionIndex].correct;
    const newAnswer = {
      questionId: questions[currentQuestionIndex].id,
      selectedAnswer: answer,
      correct: isCorrect
    };
    
    // Haptic feedback based on answer correctness
    if (isCorrect) {
      vibrate([50, 30, 50]); // Success pattern
    } else {
      vibrate(200); // Error buzz
    }
    
    // Build complete answers array
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    // Move to next or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      selectedAnswerRef.current = null; // Reset ref
    } else {
      // Pass complete answers to avoid async setState issue
      handleQuizComplete(updatedAnswers);
    }
  };

  const handleQuizComplete = (finalAnswers = userAnswers) => {
    if (isCompleting) return; // Prevent double-completion
    setIsCompleting(true);
    
    // Clear any pending auto-advance
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    setQuizStarted(false);
    
    // Calculate final score using passed-in answers (includes last answer)
    const score = finalAnswers.filter(a => a.correct).length;
    setQuizScore(score);
    
    // UPDATE entry with final score and answers
    // Entry was already created in handleCountdownComplete with score=0
    enterEvent(eventId, score, finalAnswers);
    
    // Show provisional results
    showModal(MODAL_TYPES.EVENT_PROVISIONAL_RESULTS, {
      event,
      score,
      totalQuestions: questions.length,
      onClose: () => navigate("/events")
    });
  };

  if (!event) return null;

  // Only calculate currentQuestion if questions exist
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="screen no-extra-space event-quiz-container">
      {/* Quiz Screen */}
      {quizStarted && currentQuestion && (
        <>
          {/* Header */}
          <div className="quiz-header">
            <div className="quiz-event-name">{event.icon} {event.name}</div>
            <div className="quiz-timer" style={{
              color: timeLeft <= 10 ? '#ef4444' : '#10b981'
            }}>
              ⏱ {timeLeft}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="quiz-progress-container">
            <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="quiz-progress-text">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>

          {/* Question Card */}
          <div className="quiz-question-card">
            <h2 className="quiz-question-text">{currentQuestion.question}</h2>
            
            {/* Answer Options */}
            <div className="quiz-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null || isCompleting}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {/* Auto-advancing - no Next button needed */}
            <p className="quiz-auto-advance-hint">
              {selectedAnswer === null ? 'Select your answer...' : 'Moving to next question...'}
            </p>
          </div>

          {/* Mascot - Always show pointing_v2 during quiz */}
          <div className="quiz-mascot">
            <img src={PointingMascot} alt="Mascot" />
          </div>
        </>
      )}
    </div>
  );
}
