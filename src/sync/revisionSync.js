import { supabase } from "../lib/supabaseClient.js";
import {
  normalizeLocalRevisionItem,
  convertToCloudRow,
  convertFromCloudRow,
  validateRevisionItem
} from "./revisionData.js";

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

export async function pushLocalRevision() {
  console.log("[RevisionSync] pushLocalRevision() placeholder called");
}

export async function mergeRevisionData() {
  console.log("[RevisionSync] mergeRevisionData() placeholder called");
}
