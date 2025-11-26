import { supabase } from "../lib/supabaseClient.js";
import { convertFromCloudRow } from "./revisionData.js";
import { useReviseStore } from "../store/reviseStore.js";

export async function pullCloudRevision() {
  console.log("[RevisionSync] pullCloudRevision() start");

  try {
    const { data, error } = await supabase.from("revision_items").select("*");

    if (error) {
      console.warn("[RevisionSync] pullCloudRevision ERROR:", error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.warn("[RevisionSync] pullCloudRevision returned invalid data");
      return [];
    }

    console.log(`[RevisionSync] pullCloudRevision() fetched ${data.length} rows`);
    return data.map((row) => {
      try {
        return convertFromCloudRow(row);
      } catch (e) {
        console.warn("[RevisionSync] Failed to convert row:", e.message);
        return null;
      }
    }).filter(Boolean);
  } catch (e) {
    console.warn("[RevisionSync] pullCloudRevision exception:", e.message);
    return [];
  }
}

function weakItemToCloudShape(item, userId) {
  return {
    user_id: userId,
    lesson_id: item.lessonId ?? 0,
    card_id: item.id ?? "",
    strength: 0,
    times_correct: item.timesCorrect ?? 0,
    times_wrong: item.timesWrong ?? 1,
    last_reviewed_at: item.lastSeen ?? new Date().toISOString(),
    next_review_at: null,
    extra_data: {
      question: item.question ?? "",
      options: item.options ?? [],
      answer: item.answer ?? 0,
      sourcePathId: item.sourcePathId ?? 0,
    },
    updated_at: new Date().toISOString(),
  };
}

export async function pushLocalRevision(retry = true) {
  console.log("[RevisionSync] pushLocalRevision() start");

  try {
    const state = useReviseStore.getState();
    const weakPool = state.getWeakPool() || [];
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
      console.warn("[RevisionSync] UPSERT ERROR:", error);
      if (retry) {
        console.log("[RevisionSync] Retrying push...");
        await pushLocalRevision(false);
      }
      return;
    }

    console.log("[RevisionSync] UPSERT successful");
  } catch (e) {
    console.warn("[RevisionSync] pushLocalRevision exception:", e.message);
    if (retry) {
      try {
        await pushLocalRevision(false);
      } catch (retryErr) {
        console.warn("[RevisionSync] Retry failed:", retryErr.message);
      }
    }
  }
}

export async function mergeRevisionData(cloudItems) {
  console.log("[RevisionSync] mergeRevisionData() start");

  const safeCloudItems = Array.isArray(cloudItems) ? cloudItems : [];

  try {
    const state = useReviseStore.getState();
    const local = state.getWeakPool() || [];

    const localMap = new Map();
    for (const item of local) {
      if (!item || !item.lessonId || !item.id) continue;
      const key = `${item.lessonId}-${item.id}`;
      localMap.set(key, item);
    }

    for (const cloudItem of safeCloudItems) {
      if (!cloudItem || !cloudItem.lessonId || !cloudItem.id) continue;
      const key = `${cloudItem.lessonId}-${cloudItem.id}`;
      const localItem = localMap.get(key);

      if (!localItem) {
        localMap.set(key, cloudItem);
      } else {
        const localTime = new Date(localItem.lastSeen ?? 0).getTime();
        const cloudTime = new Date(cloudItem.lastSeen ?? 0).getTime();

        if (cloudTime > localTime) {
          localMap.set(key, cloudItem);
        }
      }
    }

    const mergedArray = Array.from(localMap.values());
    state.setWeakPool(mergedArray);

    console.log(
      `[RevisionSync] merge complete: local ${local.length} → merged ${mergedArray.length}`,
    );
  } catch (e) {
    console.warn("[RevisionSync] mergeRevisionData exception:", e.message);
  }
}
