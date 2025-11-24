// /src/data/quizEngine.js
// Handles all quiz data + XP/coin calculation for all learning paths

// ---------------------------------------------------------------------
//  QUIZ DATA – Import from JSON
// ---------------------------------------------------------------------

import namesOfAllah ﷻQuizzesData from './quizzes/namesOfAllah ﷻ.json';
import foundationsQuizzesData from './quizzes/foundations.json';
import prophetsQuizzesData from './quizzes/prophets.json';
import prophetLifeQuizzesData from './quizzes/prophetLife.json';
import wivesQuizzesData from './quizzes/wivesQuizzes.json';
import tenPromisedQuizzesData from './quizzes/tenPromisedQuizzes.json';
import greatestWomenQuizzesData from './quizzes/greatestWomenQuizzes.json';
import companionsQuizzesData from './quizzes/companionsQuizzes.json';
import angelsQuizzesData from './quizzes/angelsQuizzes.json';
import endTimesQuizzesData from './quizzes/endTimesQuizzes.json';
import graveQuizzesData from './quizzes/graveQuizzes.json';
import judgementQuizzesData from './quizzes/judgementQuizzes.json';
import hellfireQuizzesData from './quizzes/hellfireQuizzes.json';
import paradiseQuizzesData from './quizzes/paradiseQuizzes.json';

// ---------------------------------------------------------------------
//  FUNCTIONS
// ---------------------------------------------------------------------

// Fetch quiz for a specific lesson based on pathId and lessonId
export const getQuizForLesson = (lessonId, pathId = 1) => {
  let quizzesData = [];
  
  // Load the correct quiz data based on pathId
  switch (parseInt(pathId)) {
    case 1:
      quizzesData = namesOfAllah ﷻQuizzesData;
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
    case 7:
      quizzesData = greatestWomenQuizzesData;
      break;
    case 8:
      quizzesData = companionsQuizzesData;
      break;
    case 9:
      quizzesData = angelsQuizzesData;
      break;
    case 10:
      quizzesData = endTimesQuizzesData;
      break;
    case 11:
      quizzesData = graveQuizzesData;
      break;
    case 12:
      quizzesData = judgementQuizzesData;
      break;
    case 13:
      quizzesData = hellfireQuizzesData;
      break;
    case 14:
      quizzesData = paradiseQuizzesData;
      break;
    default:
      quizzesData = namesOfAllah ﷻQuizzesData;
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
// Uses 75% passing threshold (changed from hardcoded 3/4)
export const calculateResults = (answers) => {
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  
  // 75% passing threshold (universal rule)
  const passingThreshold = total * 0.75;
  const passed = correct >= passingThreshold;

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
