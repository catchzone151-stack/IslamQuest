import {
  normalizeLocalRevisionItem,
  convertToCloudRow,
  convertFromCloudRow,
  validateRevisionItem
} from "./revisionData.js";

export async function pullCloudRevision() {
  console.log("[RevisionSync] pullCloudRevision() placeholder called");
  return [];
}

export async function pushLocalRevision() {
  console.log("[RevisionSync] pushLocalRevision() placeholder called");
}

export async function mergeRevisionData() {
  console.log("[RevisionSync] mergeRevisionData() placeholder called");
}
