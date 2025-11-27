export function normalizeLocalRevisionItem(item) {
  return {
    cardId: item.cardId,
    lessonId: item.lessonId,
    timesCorrect: item.timesCorrect || 0,
    timesWrong: item.timesWrong || 0,
    lastReviewedAt: item.lastReviewedAt || null,
    nextReviewAt: item.nextReviewAt || null,
    updatedAt: item.updatedAt || Date.now(),
  };
}

export function convertFromCloudRow(row) {
  return {
    cardId: row.card_id,
    lessonId: row.lesson_id,
    timesCorrect: row.times_correct || 0,
    timesWrong: row.times_wrong || 0,
    lastReviewedAt: row.last_reviewed_at || null,
    nextReviewAt: row.next_review_at || null,
    updatedAt: new Date(row.updated_at || 0).getTime(),
  };
}

export function convertToCloudRow(userId, item) {
  return {
    user_id: userId,
    lesson_id: item.lessonId,
    card_id: item.cardId,
    times_correct: item.timesCorrect || 0,
    times_wrong: item.timesWrong || 0,
    last_reviewed_at: item.lastReviewedAt
      ? new Date(item.lastReviewedAt).toISOString()
      : null,
    next_review_at: item.nextReviewAt
      ? new Date(item.nextReviewAt).toISOString()
      : null,
    updated_at: new Date(item.updatedAt || Date.now()).toISOString(),
  };
}

export function validateRevisionItem(item) {
  return (
    item &&
    typeof item.cardId !== "undefined" &&
    typeof item.lessonId !== "undefined"
  );
}

export function mergeLocalAndCloud(localArr, cloudArr) {
  const map = new Map();

  for (const c of cloudArr) {
    if (!c || !c.cardId || !c.lessonId) continue;
    map.set(`${c.lessonId}-${c.cardId}`, c);
  }

  for (const l of localArr) {
    if (!l || !l.cardId || !l.lessonId) continue;
    const key = `${l.lessonId}-${l.cardId}`;
    if (!map.has(key)) {
      map.set(key, l);
    } else {
      const existing = map.get(key);
      if ((l.updatedAt || 0) > (existing.updatedAt || 0)) {
        map.set(key, l);
      }
    }
  }

  return Array.from(map.values());
}
