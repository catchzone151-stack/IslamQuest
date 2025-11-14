import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventsStore } from "../store/eventsStore";
import { useProgressStore } from "../store/progressStore";
import { getEventQuestions } from "../data/eventQuestions";
import EventInfoModal from "../components/events/EventInfoModal";
import CountdownModal from "../components/events/CountdownModal";
import ProvisionalResultsModal from "../components/events/ProvisionalResultsModal";
import zaydDefault from "../assets/zayd_default.webp";
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

  // Check coins on mount
  useEffect(() => {
    if (coins < 25) {
      navigate("/events");
    }
  }, [coins, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up! Auto-submit
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const handleStartQuiz = () => {
    setShowInfoModal(false);
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    
    // Deduct coins
    removeCoins(25);
    
    // Load questions
    const eventQuestions = getEventQuestions(eventId, 10);
    setQuestions(eventQuestions);
    
    // Start quiz
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    // Save answer
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].options.correct;
    setUserAnswers([...userAnswers, {
      questionId: questions[currentQuestionIndex].id,
      selectedAnswer,
      correct: isCorrect
    }]);

    // Move to next or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setQuizStarted(false);
    
    // Calculate final score
    const finalAnswers = [...userAnswers];
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === questions[currentQuestionIndex].options.correct;
      finalAnswers.push({
        questionId: questions[currentQuestionIndex].id,
        selectedAnswer,
        correct: isCorrect
      });
    }
    
    const score = finalAnswers.filter(a => a.correct).length;
    setQuizScore(score);
    
    // Save entry to store
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
              {currentQuestion.options.options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              className="quiz-next-btn"
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
            </button>
          </div>

          {/* Mascot */}
          <div className="quiz-mascot">
            <img src={zaydDefault} alt="Zayd" />
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
