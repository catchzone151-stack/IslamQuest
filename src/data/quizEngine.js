// /src/data/quizEngine.js
// Handles all quiz data + XP/coin calculation for the Names of Allah path

// ---------------------------------------------------------------------
//  QUIZ DATA – Import from JSON
// ---------------------------------------------------------------------

import namesOfAllahQuizzesData from './quizzes/namesOfAllah.json';

// ---------------------------------------------------------------------
//  FUNCTIONS
// ---------------------------------------------------------------------

// Fetch quiz for a specific lesson
export const getQuizForLesson = (lessonId) => {
  const quizData = namesOfAllahQuizzesData.find(q => q.lessonId === parseInt(lessonId));
  if (!quizData) return [];
  
  // Transform JSON format to component format
  return quizData.questions.map((q, idx) => ({
    id: idx + 1,
    text: q.question,
    options: q.options,
    correctIndex: q.answer
  }));
};

// Calculate results, XP, and coins
export const calculateResults = (answers) => {
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const passed = correct >= 3;

  // XP / Coins system
  const baseXP = correct * 20;
  const bonusXP = passed ? 40 : 0;
  const perfectXP = correct === total ? 20 : 0;
  const totalXP = baseXP + bonusXP + perfectXP;

  const baseCoins = correct * 5;
  const bonusCoins = passed ? 10 : 0;
  const totalCoins = baseCoins + bonusCoins;

  return {
    total,
    correct,
    passed,
    xp: totalXP,
    coins: totalCoins,
  };
};
