import { safeCall } from "../lib/supabaseSafe.js";

import {
  pullCloudRevision,
  pushLocalRevision,
} from "./revisionSync.js";

import {
  pullProfileFromCloud,
  pushProfileToCloud,
  mergeProfileData,
} from "./profileSync.js";

// --------------------
// SYNC ON APP OPEN
// --------------------
export async function syncOnAppOpen() {
  console.log("[SyncEngine] syncOnAppOpen()");

  try {
    // 1. REVISION
    await safeCall(() => pullCloudRevision(), []);
    await safeCall(() => pushLocalRevision());

    // 2. PROFILE
    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());
  } catch (e) {
    console.warn("[SyncEngine] syncOnAppOpen error:", e.message);
  }

  console.log("[SyncEngine] syncOnAppOpen() complete");
}

// --------------------
// SYNC ON FOREGROUND
// --------------------
export async function syncOnForeground() {
  console.log("[SyncEngine] syncOnForeground()");

  try {
    // REVISION
    await safeCall(() => pullCloudRevision(), []);
    await safeCall(() => pushLocalRevision());

    // PROFILE
    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());
  } catch (e) {
    console.warn("[SyncEngine] syncOnForeground error:", e.message);
  }

  console.log("[SyncEngine] syncOnForeground() complete");
}

// --------------------
// FULL SYNC
// --------------------
export async function syncAll() {
  console.log("[SyncEngine] syncAll()");

  try {
    await safeCall(() => pullCloudRevision(), []);
    await safeCall(() => pushLocalRevision());

    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());
  } catch (e) {
    console.warn("[SyncEngine] syncAll error:", e.message);
  }

  console.log("[SyncEngine] syncAll() complete");
}

// --------------------
// PROFILE-ONLY SYNC
// --------------------
export async function syncProfileOnly() {
  console.log("[SyncEngine] syncProfileOnly()");

  try {
    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());
  } catch (e) {
    console.warn("[SyncEngine] syncProfileOnly error:", e.message);
  }

  console.log("[SyncEngine] syncProfileOnly() complete");
}
