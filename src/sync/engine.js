import { safeCall } from "../lib/supabaseSafe.js";

import {
  pullCloudRevision,
  pushLocalRevision,
  mergeRevisionData,
} from "./revisionSync.js";

import {
  pullProfileFromCloud,
  pushProfileToCloud,
  mergeProfileData,
} from "./profileSync.js";

import {
  pullDailyQuestFromCloud,
  pullStreakShieldFromCloud,
  pushDailyQuestToCloud,
  mergeDailyQuest,
  mergeStreakShield
} from "./dailyQuestSync.js";

// --------------------
// SYNC ON APP OPEN
// --------------------
export async function syncOnAppOpen() {
  console.log("[SyncEngine] syncOnAppOpen()");

  try {
    // 1. REVISION
    const cloudRevision = await safeCall(() => pullCloudRevision(), []);
    await mergeRevisionData(cloudRevision);
    await safeCall(() => pushLocalRevision());

    // 2. PROFILE
    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());

    // 3. DAILY QUEST
    const cloudQuest = await safeCall(() => pullDailyQuestFromCloud(), null);
    mergeDailyQuest(cloudQuest);
    await safeCall(() => pushDailyQuestToCloud());

    // 4. STREAK SHIELD
    const cloudShield = await safeCall(() => pullStreakShieldFromCloud(), null);
    mergeStreakShield(cloudShield);
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
    const cloudRevision = await safeCall(() => pullCloudRevision(), []);
    await mergeRevisionData(cloudRevision);
    await safeCall(() => pushLocalRevision());

    // PROFILE
    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());

    // DAILY QUEST
    const cloudQuest = await safeCall(() => pullDailyQuestFromCloud(), null);
    mergeDailyQuest(cloudQuest);
    await safeCall(() => pushDailyQuestToCloud());

    // STREAK SHIELD
    const cloudShield = await safeCall(() => pullStreakShieldFromCloud(), null);
    mergeStreakShield(cloudShield);
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
    const cloudRevision = await safeCall(() => pullCloudRevision(), []);
    await mergeRevisionData(cloudRevision);
    await safeCall(() => pushLocalRevision());

    const cloudProfile = await safeCall(() => pullProfileFromCloud(), null);
    mergeProfileData(cloudProfile);
    await safeCall(() => pushProfileToCloud());

    // DAILY QUEST
    const cloudQuest = await safeCall(() => pullDailyQuestFromCloud(), null);
    mergeDailyQuest(cloudQuest);
    await safeCall(() => pushDailyQuestToCloud());

    // STREAK SHIELD
    const cloudShield = await safeCall(() => pullStreakShieldFromCloud(), null);
    mergeStreakShield(cloudShield);
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
