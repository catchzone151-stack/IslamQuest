import { supabase } from "../lib/supabaseClient.js";
import { convertFromCloudRow } from "./revisionData.js";
import { useReviseStore } from "../store/reviseStore.js";

// -----------------------------------------------------------
// 1. PULL cloud revision table
// -----------------------------------------------------------
export async function pullCloudRevision() {
  console.log("[RevisionSync] pullCloudRevision() start");

  const { data, error } = await supabase.from("revision_items").select("*");

  if (error) {
    console.log("[RevisionSync] pullCloudRevision ERROR:", error);
    return [];
  }

  console.log(`[RevisionSync] pullCloudRevision() fetched ${data.length} rows`);
  return data.map(convertFromCloudRow);
}

// -----------------------------------------------------------
// 2. Convert local weakPool item → cloud row shape
// -----------------------------------------------------------
function weakItemToCloudShape(item, userId) {
  return {
    user_id: userId,
    lesson_id: item.lessonId,
    card_id: item.id,
    strength: 0,
    times_correct: item.timesCorrect ?? 0,
    times_wrong: item.timesWrong ?? 1,
    last_reviewed_at: item.lastSeen,
    next_review_at: null,
    extra_data: {
      question: item.question,
      options: item.options,
      answer: item.answer,
      sourcePathId: item.sourcePathId,
    },
    updated_at: new Date().toISOString(),
  };
}

// -----------------------------------------------------------
// 3. PUSH local → cloud using UPSERT
// -----------------------------------------------------------
export async function pushLocalRevision() {
  console.log("[RevisionSync] pushLocalRevision() start");

  const state = useReviseStore.getState();
  const weakPool = state.getWeakPool();
  console.log(`[RevisionSync] weakPool size: ${weakPool.length}`);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    console.log("[RevisionSync] No user authenticated, abort push.");
    return;
  }

  const rows = weakPool.map((item) => weakItemToCloudShape(item, userId));
  console.log(`[RevisionSync] Prepared ${rows.length} rows for UPSERT`);

  if (rows.length === 0) return;

  const { error } = await supabase.from("revision_items").upsert(rows, {
    onConflict: "user_id,lesson_id,card_id",
  });

  if (error) {
    console.log("[RevisionSync] UPSERT ERROR:", error);
    return;
  }

  console.log("[RevisionSync] UPSERT successful");
}

// -----------------------------------------------------------
// 4. MERGE local ↔ cloud (LOCAL-FIRST UNION)
// -----------------------------------------------------------
export async function mergeRevisionData(cloudItems = []) {
  console.log("[RevisionSync] mergeRevisionData() start");

  const state = useReviseStore.getState();
  const local = state.getWeakPool(); // array of local items

  // Convert local array → map by composite key for fast lookup
  const localMap = new Map();
  for (const item of local) {
    const key = `${item.lessonId}-${item.id}`;
    localMap.set(key, item);
  }

  // Merge cloud rows into local (cloud → local)
  for (const cloudItem of cloudItems) {
    const key = `${cloudItem.lessonId}-${cloudItem.id}`;
    const localItem = localMap.get(key);

    if (!localItem) {
      // Cloud item doesn't exist locally → add it
      localMap.set(key, cloudItem);
    } else {
      // Both exist → pick the most recently updated
      const localTime = new Date(localItem.lastSeen ?? 0).getTime();
      const cloudTime = new Date(cloudItem.lastSeen ?? 0).getTime();

      // Local dominates when timestamps conflict or equal
      if (cloudTime > localTime) {
        localMap.set(key, cloudItem);
      }
    }
  }

  // Apply merged map back to Zustand
  const mergedArray = Array.from(localMap.values());
  state.setWeakPool(mergedArray);

  console.log(
    `[RevisionSync] merge complete: local ${local.length} → merged ${mergedArray.length}`,
  );
}
