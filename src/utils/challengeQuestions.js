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

  // ── DIAGNOSTIC LOGGING ──────────────────────────────────────────────
  const _genId = `GEN_${modeId}_${Date.now()}`;
  const _ids = sanitizedQuestions.map(q => q.id);
  const _texts = sanitizedQuestions.map(q => q.question);
  const _uniqueIds = new Set(_ids).size;
  const _uniqueTexts = new Set(_texts).size;
  const _dupIds = _ids.length - _uniqueIds;
  const _dupTexts = _texts.length - _uniqueTexts;
  console.log('[IQ_QSEL] generateQuestionsForChallenge', {
    genId: _genId,
    modeId,
    count: _ids.length,
    uniqueIdCount: _uniqueIds,
    uniqueTextCount: _uniqueTexts,
    duplicateIdCount: _dupIds,
    duplicateTextCount: _dupTexts,
    ids: _ids,
    questionTexts: _texts.map((t, i) => `[${i}] ${t.slice(0, 50)}`),
  });
  if (_dupIds > 0 || _dupTexts > 0) {
    console.error('[IQ_QSEL] WITHIN-SESSION DUPLICATE DETECTED — generateQuestionsForChallenge', {
      genId: _genId,
      modeId,
      totalIds: _ids.length,
      uniqueIds: _uniqueIds,
      duplicateIdCount: _dupIds,
      duplicateTextCount: _dupTexts,
      allIds: _ids,
      duplicateIds: _ids.filter((id, i) => _ids.indexOf(id) !== i),
      duplicateTexts: _texts.filter((t, i) => _texts.indexOf(t) !== i),
    });
  }
  // ── END DIAGNOSTIC ──────────────────────────────────────────────────

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
