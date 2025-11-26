import { supabase } from "../lib/supabaseClient.js";
import {
  convertFromCloudRow
} from "./revisionData.js";
import { useReviseStore } from "../store/reviseStore.js";

// Pull ALL cloud revision rows
export async function pullCloudRevision() {
  console.log("[RevisionSync] pullCloudRevision() start");

  const { data, error } = await supabase
    .from("revision_items")
    .select("*");

  if (error) {
    console.log("[RevisionSync] pullCloudRevision ERROR:", error);
    return [];
  }

  console.log(`[RevisionSync] pullCloudRevision() fetched ${data.length} rows`);
  return data.map(convertFromCloudRow);
}

// ------------------------
// Convert weakPool → cloud row shape
// ------------------------
function weakItemToCloudShape(item, userId) {
  return {
    user_id: userId,
    lesson_id: item.lessonId,
    card_id: item.id,
    strength: 0,
    times_correct: 0,
    times_wrong: 1,
    last_reviewed_at: item.lastSeen,
    next_review_at: null,
    extra_data: {
      question: item.question,
      options: item.options,
      answer: item.answer,
      sourcePathId: item.sourcePathId
    },
    updated_at: new Date().toISOString()
  };
}

// ------------------------
// Push local revision (weakPool) to cloud using UPSERT
// ------------------------
export async function pushLocalRevision() {
  console.log("[RevisionSync] pushLocalRevision() start");

  const state = useReviseStore.getState();
  const weakPool = state.getWeakPool();
  console.log(`[RevisionSync] weakPool size: ${weakPool.length}`);

  // Get user id
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    console.log("[RevisionSync] No user authenticated, abort push.");
    return;
  }

  const rows = weakPool.map((item) => weakItemToCloudShape(item, userId));
  console.log(`[RevisionSync] Prepared ${rows.length} rows for UPSERT`);

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("revision_items")
    .upsert(rows, {
      onConflict: "user_id,lesson_id,card_id",
    });

  if (error) {
    console.log("[RevisionSync] UPSERT ERROR:", error);
    return;
  }

  console.log("[RevisionSync] UPSERT successful");
}

// ------------------------
// Merge logic placeholder
// ------------------------
export async function mergeRevisionData() {
  console.log("[RevisionSync] mergeRevisionData() placeholder called");
}
