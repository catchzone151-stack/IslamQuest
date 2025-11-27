export function normalizeLocalRevisionItem(item) {
  return {
    id: item.id || item.cardId,
    lessonId: item.lessonId,
    question: item.question || item.extraData?.question || "",
    options: item.options || item.extraData?.options || [],
    answer: item.answer ?? item.extraData?.answer ?? 0,
    sourcePathId: item.sourcePathId || item.extraData?.sourcePathId || 0,
    timesCorrect: item.timesCorrect || 0,
    timesWrong: item.timesWrong || 0,
    lastSeen: item.lastSeen || item.lastReviewedAt || null,
  };
}

export function convertFromCloudRow(row) {
  const extraData = row.extra_data || {};
  return {
    id: row.card_id,
    lessonId: row.lesson_id,
    question: extraData.question || "",
    options: extraData.options || [],
    answer: extraData.answer ?? 0,
    sourcePathId: extraData.sourcePathId || 0,
    timesCorrect: row.times_correct || 0,
    timesWrong: row.times_wrong || 0,
    lastSeen: row.last_reviewed_at || null,
  };
}

export function convertToCloudRow(userId, item) {
  return {
    user_id: userId,
    lesson_id: item.lessonId,
    card_id: item.id,
    strength: 0,
    times_correct: item.timesCorrect || 0,
    times_wrong: item.timesWrong || 0,
    last_reviewed_at: item.lastSeen || null,
    next_review_at: null,
    extra_data: {
      question: item.question || "",
      options: item.options || [],
      answer: item.answer ?? 0,
      sourcePathId: item.sourcePathId || 0,
    },
    updated_at: new Date().toISOString(),
  };
}

export function validateRevisionItem(item) {
  return (
    item &&
    typeof item.id !== "undefined" &&
    typeof item.lessonId !== "undefined"
  );
}

export function mergeLocalAndCloud(localArr, cloudArr) {
  const map = new Map();

  for (const c of cloudArr) {
    map.set(`${c.lessonId}-${c.id}`, c);
  }

  for (const l of localArr) {
    const key = `${l.lessonId}-${l.id}`;
    if (!map.has(key)) {
      map.set(key, l);
    } else {
      const existing = map.get(key);
      const localTime = new Date(l.lastSeen || 0).getTime();
      const cloudTime = new Date(existing.lastSeen || 0).getTime();
      if (localTime > cloudTime) {
        map.set(key, l);
      }
    }
  }

  return Array.from(map.values());
}
