import { useChallengeStore, CHALLENGE_MODES } from "../store/challengeStore";

export const generateQuestionsForChallenge = (modeId) => {
  const modeConfig = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
  if (!modeConfig) {
    console.error("[ChallengeQuestions] Invalid mode:", modeId);
    return [];
  }

  const questions = useChallengeStore.getState().getQuestionsForMode(modeConfig);

  const raw = questions.map((q, index) => ({
    id: `q_${index}`,
    question: q.question,
    options: q.options,
    answer: q.answer,
    difficulty: q.difficulty || "medium",
  }));

  // ── LAYER 3: Text-level Map dedup at the sanitizer boundary ─────────────────
  const _genId = `GEN_${modeId}_${Date.now()}`;
  const _textMap = new Map();
  for (const q of raw) {
    const _key = q.question.trim().toLowerCase();
    if (!_textMap.has(_key)) _textMap.set(_key, q);
  }
  const _removedCount = raw.length - _textMap.size;
  if (_removedCount > 0) {
    console.warn('[IQ_DEDUP] generateQuestionsForChallenge: duplicates stripped', {
      genId: _genId, modeId, removedCount: _removedCount,
    });
  }
  // Re-assign sequential IDs so they are always q_0…q_N with no gaps
  const sanitizedQuestions = [..._textMap.values()].map((q, i) => ({ ...q, id: `q_${i}` }));
  // ── END LAYER 3 ─────────────────────────────────────────────────────────────

  const _ids   = sanitizedQuestions.map(q => q.id);
  const _texts = sanitizedQuestions.map(q => q.question);
  const _uniqueIds   = new Set(_ids).size;
  const _uniqueTexts = new Set(_texts).size;
  console.log('[IQ_QSEL] generateQuestionsForChallenge COMPLETE', {
    genId: _genId,
    modeId,
    totalSelected: sanitizedQuestions.length,
    uniqueIdCount: _uniqueIds,
    uniqueTextCount: _uniqueTexts,
    duplicateRemovedCount: _removedCount,
    ids: _ids,
    questionTexts: _texts.map((t, i) => `[${i}] ${t.slice(0, 50)}`),
  });
  if (_uniqueIds !== sanitizedQuestions.length || _uniqueTexts !== sanitizedQuestions.length) {
    console.error('[IQ_QSEL] WITHIN-SESSION DUPLICATE STILL PRESENT after Layer 3 — generateQuestionsForChallenge', {
      genId: _genId, modeId, totalSelected: sanitizedQuestions.length,
      uniqueIdCount: _uniqueIds, uniqueTextCount: _uniqueTexts,
    });
  }

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
