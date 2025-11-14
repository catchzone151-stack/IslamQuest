import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventsStore } from "../store/eventsStore";
import { useProgressStore } from "../store/progressStore";
import { getEventQuestions } from "../data/eventQuestions";
import EventInfoModal from "../components/events/EventInfoModal";
import CountdownModal from "../components/events/CountdownModal";
import ProvisionalResultsModal from "../components/events/ProvisionalResultsModal";
import assets from "../assets/assets";
import "./EventQuiz.css";

export default function EventQuiz() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEvents, enterEvent, hasEntered } = useEventsStore();
  const { coins, removeCoins } = useProgressStore();
  
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds total
  const [showProvisionalResults, setShowProvisionalResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const autoAdvanceTimeoutRef = React.useRef(null);
  const selectedAnswerRef = React.useRef(null);

  // Redirect if invalid event or already entered
  useEffect(() => {
    if (!event) {
      navigate("/events");
      return;
    }
    
    if (hasEntered(eventId)) {
      alert("You've already entered this event!");
      navigate("/events");
    }
  }, [event, eventId, hasEntered, navigate]);

  // Check coins on mount - only before quiz starts
  useEffect(() => {
    if (!quizStarted && !showCountdown && coins < 25) {
      alert("You need 25 coins to enter this event!");
      navigate("/events");
    }
  }, [coins, navigate, quizStarted, showCountdown]);

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
    setShowInfoModal(false);
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    
    // Defensive re-check: verify user hasn't already entered and has enough coins
    if (hasEntered(eventId)) {
      alert("You've already entered this event!");
      navigate("/events");
      return;
    }
    
    // Deduct coins - abort if insufficient funds
    const success = removeCoins(25);
    if (!success) {
      alert("You don't have enough coins! You need 25 coins to enter.");
      navigate("/events");
      return;
    }
    
    // Load questions
    const eventQuestions = getEventQuestions(eventId, 10);
    setQuestions(eventQuestions);
    
    // Start quiz
    setQuizStarted(true);
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
    
    // Save entry to store with complete answers
    enterEvent(eventId, score, finalAnswers);
    
    // Show provisional results
    setShowProvisionalResults(true);
  };

  if (!event) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="event-quiz-container">
      {/* Info Modal */}
      {showInfoModal && (
        <EventInfoModal
          event={event}
          onStart={handleStartQuiz}
          onCancel={() => navigate("/events")}
        />
      )}

      {/* Countdown Modal */}
      {showCountdown && (
        <CountdownModal onComplete={handleCountdownComplete} />
      )}

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

          {/* Mascot */}
          <div className="quiz-mascot">
            <img src={assets.mascots.mascot_zayd_default} alt="Zayd" />
          </div>
        </>
      )}

      {/* Provisional Results Modal */}
      {showProvisionalResults && (
        <ProvisionalResultsModal
          event={event}
          score={quizScore}
          totalQuestions={questions.length}
          onClose={() => navigate("/events")}
        />
      )}
    </div>
  );
}
