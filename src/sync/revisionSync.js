import { supabase } from "../lib/supabaseClient.js";
import {
  convertFromCloudRow,
  convertToCloudRow,
  validateRevisionItem,
} from "./revisionData.js";
import { useReviseStore } from "../store/reviseStore.js";

export async function pullCloudRevision() {
  console.log("[RevisionSync] pullCloudRevision() start");

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    console.log("[RevisionSync] No user authenticated, skip pull");
    return [];
  }

  const { data, error } = await supabase
    .from("revision_items")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    if (error.code === "42P01") {
      console.log("[RevisionSync] Table not ready, using local-only mode");
      return [];
    }
    console.warn("[RevisionSync] pullCloudRevision ERROR:", error);
    return [];
  }

  console.log(`[RevisionSync] pullCloudRevision() fetched ${data?.length || 0} rows`);
  return (data || []).map(convertFromCloudRow);
}

export async function pushLocalRevision() {
  console.log("[RevisionSync] PUSH TRIGGERED");
  console.log("[RevisionSync] pushLocalRevision() start");

  const items = useReviseStore.getState().getAllItems();
  const ready = items.filter((i) => validateRevisionItem(i));
  console.log(`[RevisionSync] allItems size: ${items.length}, valid: ${ready.length}`);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  console.log("[RevisionSync] userId:", userId);
  if (!userId) {
    console.log("[RevisionSync] No user authenticated, skip push");
    return;
  }

  if (!ready.length) {
    console.log("[RevisionSync] No valid items to push");
    return;
  }

  const rows = ready.map((i) => convertToCloudRow(userId, i));
  console.log(`[RevisionSync] Prepared ${rows.length} rows for UPSERT`);
  console.log("[RevisionSync] rows to upsert:", rows);

  const { error } = await supabase
    .from("revision_items")
    .upsert(rows, {
      onConflict: "user_id,lesson_id,card_id",
    });

  if (error) {
    if (error.code === "42P01" || error.code === "42P10") {
      console.log("[RevisionSync] Table/constraint not ready, using local-only mode");
      return;
    }
    console.warn("[RevisionSync] UPSERT ERROR:", error);
    return;
  }

  useReviseStore.setState({ needsSync: false });
  console.log("[RevisionSync] UPSERT DONE");
  console.log("[RevisionSync] UPSERT successful");
}
