// /src/data/quizEngine.js
// Handles all quiz data + XP/coin calculation for all learning paths

// ---------------------------------------------------------------------
//  QUIZ DATA – Import from JSON
// ---------------------------------------------------------------------

import namesOfAllahQuizzesData from './quizzes/namesOfAllah.json';
import foundationsQuizzesData from './quizzes/foundations.json';
import prophetsQuizzesData from './quizzes/prophets.json';
import prophetLifeQuizzesData from './quizzes/prophetLife.json';
import wivesQuizzesData from './quizzes/wivesQuizzes.json';
import tenPromisedQuizzesData from './quizzes/tenPromisedQuizzes.json';

// ---------------------------------------------------------------------
//  FUNCTIONS
// ---------------------------------------------------------------------

// Fetch quiz for a specific lesson based on pathId and lessonId
export const getQuizForLesson = (lessonId, pathId = 1) => {
  let quizzesData = [];
  
  // Load the correct quiz data based on pathId
  switch (parseInt(pathId)) {
    case 1:
      quizzesData = namesOfAllahQuizzesData;
      break;
    case 2:
      quizzesData = foundationsQuizzesData;
      break;
    case 3:
      quizzesData = prophetsQuizzesData;
      break;
    case 4:
      quizzesData = prophetLifeQuizzesData;
      break;
    case 5:
      quizzesData = wivesQuizzesData;
      break;
    case 6:
      quizzesData = tenPromisedQuizzesData;
      break;
    default:
      quizzesData = namesOfAllahQuizzesData;
  }
  
  const quizData = quizzesData.find(q => q.lessonId === parseInt(lessonId));
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
