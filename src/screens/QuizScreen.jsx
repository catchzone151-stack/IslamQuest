import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { getQuizForLesson, calculateResults } from "../data/quizEngine";
import { mascotQuizStates } from "../data/mascotQuizStates";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { useAnalytics } from "../hooks/useAnalytics";
import SittingMascot from "../assets/mascots/mascot_sitting_v2.webp";
import CongratsMascot from "../assets/mascots/mascot_congratulation.webp";

import QuizHeader from "../components/quiz/QuizHeader";
import QuestionCard from "../components/quiz/QuestionCard";

const shuffleQuestion = (q) => {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const options = order.map((i) => q.options[i]);
  const correctIndex = order.indexOf(q.correctIndex);
  return { ...q, options, correctIndex };
};

const QuizScreen = () => {
  const { pathId, lessonId } = useParams();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const [quizData, setQuizData] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isQuizDone, setIsQuizDone] = useState(false);
  const [mascotMood, setMascotMood] = useState("start");
  const [results, setResults] = useState(null);

  const applyQuizResults = useProgressStore((s) => s.applyQuizResults);
  const { showModal } = useModalStore();

  useEffect(() => {
    const raw = getQuizForLesson(lessonId, pathId) || [];
    const prepared = raw.map(shuffleQuestion);
    setQuizData(prepared);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setIsQuizDone(false);
    setResults(null);
    setMascotMood("start");
  }, [lessonId, pathId]);

  const handleSelect = (index) => {
    if (selected !== null || isQuizDone) return;
    const q = quizData[currentQ];
    if (!q) return;

    const isCorrect = index === q.correctIndex;
    const updatedAnswers = [
      ...answers,
      { questionId: q.id, correct: isCorrect },
    ];

    setSelected(index);
    setAnswers(updatedAnswers);
    setMascotMood(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      const isLast = currentQ === quizData.length - 1;
      if (isLast) {
        finishQuiz(updatedAnswers);
      } else {
        setCurrentQ((prev) => prev + 1);
        setSelected(null);
        setMascotMood("thinking");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 900);
  };

  const finishQuiz = (finalAnswers) => {
    const res = calculateResults(finalAnswers);
    setResults(res);
    
    // Apply quiz results (unlocks next lesson, awards XP/coins, updates progress)
    applyQuizResults(
      { xp: res.xp, coins: res.coins },
      parseInt(pathId),
      parseInt(lessonId)
    );
    
    // Track quiz completion for analytics
    analytics('quiz_completed', {
      pathId: parseInt(pathId),
      lessonId: parseInt(lessonId),
      score: res.correct,
      total: res.total,
      passed: res.passed,
      xpEarned: res.xp,
      coinsEarned: res.coins
    });
    
    setIsQuizDone(true);
    setMascotMood(res.passed ? "pass" : "fail");
    
    // Show reward modal
    showModal(MODAL_TYPES.REWARD, {
      score: res.correct,
      totalQ: res.total,
      xp: res.xp,
      coins: res.coins,
      passed: res.passed,
      mascotImg: mascotQuizStates[res.passed ? "pass" : "fail"],
      onRetry: handleRetry,
      onContinue: handleContinue
    });
  };

  const handleRetry = () => {
    const raw = getQuizForLesson(lessonId, pathId) || [];
    const prepared = raw.map(shuffleQuestion);
    setQuizData(prepared);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setIsQuizDone(false);
    setResults(null);
    setMascotMood("start");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContinue = () => {
    navigate(`/path/${pathId}`);
  };

  if (!quizData || quizData.length === 0) {
    return (
      <div className="screen no-extra-space flex flex-col items-center justify-center text-center text-white">
        <p>No quiz data found for this lesson.</p>
        <button
          className="mt-4 px-4 py-2 bg-[#F4C542] text-black rounded-xl"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const progress =
    ((isQuizDone ? quizData.length : currentQ + 1) / quizData.length) * 100;

  // Get mascot based on progress through quiz
  const getMascot = () => {
    if (currentQ <= 2) return SittingMascot;
    return CongratsMascot;
  };

  return (
    <div className="screen no-extra-space bg-gradient-to-b from-[#0A0F1E] to-[#030614] text-white flex flex-col">
      <QuizHeader
        currentQ={currentQ}
        totalQ={quizData.length}
        mascotMood={mascotMood}
        isQuizDone={isQuizDone}
        progressMascot={!isQuizDone ? getMascot() : mascotQuizStates[mascotMood]}
      />

      <div className="h-2 bg-gray-800 w-full">
        <div
          className="h-2 bg-[#F4C542] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        {!isQuizDone && (
          <QuestionCard
            question={quizData[currentQ]}
            currentQ={currentQ}
            totalQ={quizData.length}
            selected={selected}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
};

export default QuizScreen;
