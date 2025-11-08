import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizForLesson, calculateResults } from '../data/quizEngine';
import { mascotQuizStates } from '../data/mascotQuizStates';
import { useProgressStore } from '../store/progressStore';
import { useTitleStore } from '../store/useTitleStore';

import QuizHeader from '../components/quiz/QuizHeader';
import QuestionCard from '../components/quiz/QuestionCard';
import RewardModal from '../components/quiz/RewardModal';

const QuizScreen = () => {
  const { pathId, lessonId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mascotMood, setMascotMood] = useState('start');
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const updateXPandCoins = useProgressStore((state) => state.updateXPandCoins);
  const evaluateTitle = useTitleStore((state) => state.evaluateTitle);

  useEffect(() => {
    const quiz = getQuizForLesson(lessonId);
    if (quiz) {
      setQuizData(quiz);
    } else {
      setQuizData([]);
    }
  }, [lessonId]);

  const handleAnswer = (selectedIndex) => {
    const currentQuestion = quizData[currentQ];
    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, correct: isCorrect },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setMascotMood('correct');
    } else {
      setMascotMood('incorrect');
    }

    setSelected(selectedIndex);
  };

  const handleNext = () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setMascotMood('thinking');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const results = calculateResults(answers);
    setXpEarned(results.xp);
    setCoinsEarned(results.coins);
    setShowResults(true);
    updateXPandCoins(results.xp, results.coins);
    evaluateTitle();
    setMascotMood(results.passed ? 'pass' : 'fail');
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setShowResults(false);
    setMascotMood('start');
  };

  const handleContinue = () => {
    navigate(`/path/${pathId}`);
  };

  if (!quizData || quizData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-white">
        <p>No quiz data found for this lesson.</p>
        <button
          className="mt-4 px-4 py-2 bg-gold-500 text-black rounded-xl"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#030614] text-white flex flex-col">
      <QuizHeader
        currentQ={currentQ}
        totalQ={quizData.length}
        mascotMood={mascotMood}
      />

      {!showResults ? (
        <QuestionCard
          question={quizData[currentQ]}
          currentQ={currentQ}
          totalQ={quizData.length}
          selected={selected}
          onSelect={handleAnswer}
          onNext={handleNext}
        />
      ) : (
        <RewardModal
          score={score}
          totalQ={quizData.length}
          xpEarned={xpEarned}
          coinsEarned={coinsEarned}
          mascotMood={mascotMood}
          onRetry={handleRetry}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

export default QuizScreen;
