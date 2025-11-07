// src/engine/quizEngine.js
// Islam Quest — Quiz Engine (Badge-free version)
// Handles quiz logic, scoring, XP, coins, and unlocks. Certificates optional.
// Now simplified for the title-based system.

// ---------- Utilities ----------
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------- Core API ----------

/**
 * Create a new quiz session.
 */
export function createQuiz(cfg) {
  if (!cfg || !Array.isArray(cfg.questions) || cfg.questions.length === 0)
    throw new Error("createQuiz: questions array required.");

  const shuffleQuestions = cfg.shuffleQuestions !== false;
  const shuffleAnswers = cfg.shuffleAnswers !== false;
  const timePerQuestionSec = cfg.timePerQuestionSec ?? null;
  const passMark = typeof cfg.passMark === "number" ? cfg.passMark : 0.7;

  let questions = deepClone(cfg.questions);
  if (shuffleQuestions) shuffleInPlace(questions);

  if (shuffleAnswers) {
    questions = questions.map((q) => {
      const indexed = q.options.map((opt, i) => ({ opt, i }));
      shuffleInPlace(indexed);
      const options = indexed.map((x) => x.opt);
      const newCorrectIndex = indexed.findIndex((x) => x.i === q.correctIndex);
      return { ...q, options, correctIndex: newCorrectIndex };
    });
  }

  return {
    id: uuid(),
    index: 0,
    questions,
    userAnswers: Array(questions.length).fill(-1),
    correctCount: 0,
    total: questions.length,
    finished: false,
    timePerQuestionSec,
    passMark,
    startedAt: Date.now(),
    finishedAt: null,
  };
}

/**
 * Return current question.
 */
export function getCurrentQuestion(state) {
  if (!state || state.finished) return null;
  return state.questions[state.index] || null;
}

/**
 * Answer current question.
 */
export function answerCurrent(state, answerIndex) {
  if (state.finished) throw new Error("Quiz finished.");
  const q = getCurrentQuestion(state);
  if (!q) throw new Error("No current question.");
  if (answerIndex < 0 || answerIndex >= q.options.length)
    throw new Error("Invalid answer index.");

  // Prevent changing previous answers
  if (state.userAnswers[state.index] !== -1) {
    return {
      correct: state.userAnswers[state.index] === q.correctIndex,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    };
  }

  state.userAnswers[state.index] = answerIndex;
  const correctNow = answerIndex === q.correctIndex;
  if (correctNow) state.correctCount += 1;

  return { correct: correctNow, correctIndex: q.correctIndex, explanation: q.explanation };
}

/**
 * Go to next question or finish quiz.
 */
export function next(state) {
  if (state.finished) return false;
  if (state.index < state.total - 1) {
    state.index += 1;
    return true;
  }
  state.finished = true;
  state.finishedAt = Date.now();
  return false;
}

/**
 * Calculate results (XP, coins, pass/fail).
 */
export function getResults(state) {
  const correct = state.correctCount;
  const total = state.total;
  const percentage = total ? correct / total : 0;
  const passed = percentage >= state.passMark;

  // Reward rules
  const xp = correct * 10 + (correct === total && total > 0 ? 25 : 0);
  const coins = correct;

  // Summarise by lesson
  const summaryByLesson = {};
  state.questions.forEach((q, i) => {
    const ok = state.userAnswers[i] === q.correctIndex;
    const key = q.pathId + "::" + q.lessonId;
    if (!summaryByLesson[key]) summaryByLesson[key] = { correct: 0, total: 0 };
    summaryByLesson[key].total += 1;
    if (ok) summaryByLesson[key].correct += 1;
  });

  return {
    correct,
    total,
    percentage,
    passed,
    rewards: { xp, coins },
    summaryByLesson,
  };
}

/**
 * Build payload for progressStore (used to update XP, coins, unlocks, etc.)
 */
export function buildProgressPayload(state) {
  const { rewards, passed, summaryByLesson } = getResults(state);

  // Unlock next lessons if passed ≥70% each
  const unlocks = [];
  Object.keys(summaryByLesson).forEach((key) => {
    const [pathId, lessonId] = key.split("::");
    const perf = summaryByLesson[key];
    const ratio = perf.total ? perf.correct / perf.total : 0;
    if (ratio >= 0.7) unlocks.push({ pathId, lessonId: getNextLessonId(lessonId) });
  });

  // Optional: certificate if full path passed
  const certificate = passed ? tryBuildCertificate(state.questions) : null;

  return {
    xp: rewards.xp,
    coins: rewards.coins,
    unlocks,
    certificate,
  };
}

// ---------- Helpers ----------
function getNextLessonId(current) {
  const m = String(current).match(/(.*?)(\d+)$/);
  if (!m) return current;
  const prefix = m[1];
  const num = parseInt(m[2], 10);
  return `${prefix}${num + 1}`;
}

function tryBuildCertificate(questions) {
  const pathIds = new Set(questions.map((q) => q.pathId));
  if (pathIds.size === 1) return { pathId: Array.from(pathIds)[0] };
  return null;
}
