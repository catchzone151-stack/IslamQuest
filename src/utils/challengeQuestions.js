import { useChallengeStore, CHALLENGE_MODES } from "../store/challengeStore";

export const generateQuestionsForChallenge = (modeId) => {
  const modeConfig = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
  if (!modeConfig) {
    console.error("[ChallengeQuestions] Invalid mode:", modeId);
    return [];
  }
  
  const questions = useChallengeStore.getState().getQuestionsForMode(modeConfig);
  
  const sanitizedQuestions = questions.map((q, index) => ({
    id: `q_${index}`,
    question: q.question,
    options: q.options,
    answer: q.answer,
    difficulty: q.difficulty || "medium",
  }));
  
  console.log(`[ChallengeQuestions] Generated ${sanitizedQuestions.length} questions for ${modeId}`);
  return sanitizedQuestions;
};

export const getModeConfig = (modeId) => {
  return Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
};

export const getModeIcon = (modeId) => {
  const mode = getModeConfig(modeId);
  return mode?.icon || "🎮";
};

export const getModeName = (modeId) => {
  const mode = getModeConfig(modeId);
  return mode?.name || "Challenge";
};

export const getModeRewards = (modeId, result) => {
  const mode = getModeConfig(modeId);
  if (!mode) return { xp: 0, coins: 0 };
  return mode.rewards[result] || { xp: 0, coins: 0 };
};
