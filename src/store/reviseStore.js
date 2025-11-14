import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import { getQuizForLesson } from "../data/quizEngine";

const STORAGE_KEY = "islamQuestRevise";

// Helper: Shuffle array (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Generate unique question ID to avoid duplicates
function getQuestionId(question, pathId, lessonId) {
  return `${pathId}_${lessonId}_${question.text.substring(0, 30)}`;
}

export const useReviseStore = create((set, get) => ({
  // Weak question pool: questions user has gotten wrong
  weakPool: [], // { id, question, options, answer, sourcePathId, lessonId, lastSeen }

  // Load from LocalStorage
  loadReviseData: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      set({ weakPool: data.weakPool || [] });
    }

    // 🛠️ DEV: Auto-populate sample weak questions for testing
    if (import.meta.env.DEV && get().weakPool.length === 0) {
      get().populateSampleWeakQuestions();
    }
  },

  // 🛠️ DEV ONLY: Populate sample wrong questions for testing
  populateSampleWeakQuestions: () => {
    const { lessonStates } = useProgressStore.getState();
    const completedLessons = [];

    // Iterate through nested lessonStates: { pathId: { lessonId: { passed: true } } }
    Object.keys(lessonStates).forEach((pathId) => {
      const pathState = lessonStates[pathId];
      Object.keys(pathState).forEach((lessonId) => {
        if (pathState[lessonId]?.passed) {
          completedLessons.push({
            pathId: parseInt(pathId),
            lessonId: parseInt(lessonId),
          });
        }
      });
    });

    if (completedLessons.length === 0) return;

    const sampleQuestions = [];
    // Take first 3 completed lessons and grab 2 questions from each
    completedLessons.slice(0, 3).forEach(({ pathId, lessonId }) => {
      const quizData = getQuizForLesson(lessonId, pathId);
      // quizData is an array of questions, not an object with questions property
      if (quizData && Array.isArray(quizData) && quizData.length > 0) {
        quizData.slice(0, 2).forEach((q) => {
          const questionId = getQuestionId(q, pathId, lessonId);
          sampleQuestions.push({
            id: questionId,
            question: q.text,
            options: q.options,
            answer: q.correctIndex,
            sourcePathId: pathId,
            lessonId: lessonId,
            lastSeen: new Date().toISOString(),
          });
        });
      }
    });

    if (sampleQuestions.length > 0) {
      set({ weakPool: sampleQuestions });
      get().saveReviseData();
    }
  },

  // Save to LocalStorage
  saveReviseData: () => {
    const data = get();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        weakPool: data.weakPool,
      })
    );
  },

  // Save a wrong question to the weak pool
  // Supabase-ready: will become async DB insert
  saveWrongQuestion: (question, pathId, lessonId) => {
    const state = get();
    const questionId = getQuestionId(question, pathId, lessonId);

    // Check if already exists
    const exists = state.weakPool.some((q) => q.id === questionId);
    if (exists) {
      // Update lastSeen timestamp
      const updated = state.weakPool.map((q) =>
        q.id === questionId
          ? { ...q, lastSeen: new Date().toISOString() }
          : q
      );
      set({ weakPool: updated });
    } else {
      // Add new wrong question
      const newQuestion = {
        id: questionId,
        question: question.text || question.question,
        options: question.options,
        answer: question.correctIndex !== undefined ? question.correctIndex : question.answer,
        sourcePathId: pathId,
        lessonId: lessonId,
        lastSeen: new Date().toISOString(),
      };
      set({ weakPool: [...state.weakPool, newQuestion] });
    }

    get().saveReviseData();
  },

  // Get weak question pool for revision
  getWeakPool: () => {
    return get().weakPool;
  },

  // Remove question from weak pool (user mastered it)
  removeIfMastered: (questionId) => {
    const state = get();
    const updated = state.weakPool.filter((q) => q.id !== questionId);
    set({ weakPool: updated });
    get().saveReviseData();
  },

  // Update lastSeen timestamp (user got it wrong again)
  updateLastSeen: (questionId) => {
    const state = get();
    const updated = state.weakPool.map((q) =>
      q.id === questionId
        ? { ...q, lastSeen: new Date().toISOString() }
        : q
    );
    set({ weakPool: updated });
    get().saveReviseData();
  },

  // Get random sample of N questions from weak pool
  getRevisionSession: (count = 10) => {
    const pool = get().weakPool;
    if (pool.length === 0) return [];

    const shuffled = shuffle(pool);
    return shuffled.slice(0, Math.min(count, pool.length));
  },

  // Get weakest learning path (lowest accuracy)
  // Supabase-ready: will become async query
  getWeakestPath: () => {
    const { paths, lessonStates } = useProgressStore.getState();
    const weakPool = get().weakPool;

    // Calculate stats for each path
    const pathStats = paths.map((path) => {
      let completedLessons = 0;
      let totalQuestions = 0;
      let wrongQuestions = 0;

      // Check if this path has any completed lessons
      const pathState = lessonStates[path.id];
      if (pathState) {
        Object.keys(pathState).forEach((lessonId) => {
          if (pathState[lessonId]?.passed) {
            completedLessons++;
            // Count total questions in this lesson
            const quizData = getQuizForLesson(parseInt(lessonId), path.id);
            if (quizData && Array.isArray(quizData)) {
              totalQuestions += quizData.length;
            }
          }
        });
      }

      // Count wrong questions from weak pool for this path
      wrongQuestions = weakPool.filter(
        (q) => q.sourcePathId === path.id
      ).length;

      // Calculate mistake density: wrong questions per completed lesson
      // Higher density = weaker path
      const mistakeDensity = completedLessons > 0 ? wrongQuestions / completedLessons : 0;

      // Convert to accuracy score (lower density = higher accuracy)
      // Use exponential decay to differentiate between paths
      // density 0 → accuracy 1.0, density 1 → accuracy ~0.63, density 2 → accuracy ~0.37, etc.
      const accuracy = Math.exp(-mistakeDensity);

      return {
        ...path,
        completedLessons,
        totalQuestions,
        wrongQuestions,
        mistakeDensity,
        accuracy,
      };
    });

    // Filter paths with at least some completed lessons
    const activePaths = pathStats.filter((p) => p.completedLessons > 0);

    if (activePaths.length === 0) {
      return null;
    }

    // Filter to only paths with mistakes (unless all paths are perfect)
    const pathsWithMistakes = activePaths.filter((p) => p.wrongQuestions > 0);

    // If all paths are perfect, return null (no weak path)
    if (pathsWithMistakes.length === 0) {
      return null;
    }

    // Return path with highest mistake density
    return pathsWithMistakes.reduce((weakest, current) =>
      current.mistakeDensity > weakest.mistakeDensity ? current : weakest
    );
  },

  // Get Smart Revision pack (8 questions from weakest path)
  // Supabase-ready: will become async query
  getSmartRevisionPack: () => {
    const weakestPath = get().getWeakestPath();

    if (!weakestPath) {
      return [];
    }

    const { lessonStates } = useProgressStore.getState();
    const pathState = lessonStates[weakestPath.id];

    if (!pathState) {
      return [];
    }

    // Collect all questions from completed lessons in this path
    const allQuestions = [];
    Object.keys(pathState).forEach((lessonId) => {
      if (pathState[lessonId]?.passed) {
        const quizData = getQuizForLesson(parseInt(lessonId), weakestPath.id);
        // quizData is an array of questions
        if (quizData && Array.isArray(quizData)) {
          quizData.forEach((q) => {
            allQuestions.push({
              id: getQuestionId(q, weakestPath.id, parseInt(lessonId)),
              question: q.text,
              options: q.options,
              answer: q.correctIndex,
              sourcePathId: weakestPath.id,
              lessonId: parseInt(lessonId),
            });
          });
        }
      }
    });

    if (allQuestions.length === 0) {
      return [];
    }

    // Shuffle and pick 8 questions
    const shuffled = shuffle(allQuestions);
    return shuffled.slice(0, Math.min(8, shuffled.length));
  },
}));
