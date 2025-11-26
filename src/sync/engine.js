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

  // 1. REVISION
  const cloudRevision = await pullCloudRevision();
  await mergeRevisionData(cloudRevision);
  await pushLocalRevision();

  // 2. PROFILE
  const cloudProfile = await pullProfileFromCloud();
  mergeProfileData(cloudProfile);
  await pushProfileToCloud();

  // 3. DAILY QUEST
  const cloudQuest = await pullDailyQuestFromCloud();
  mergeDailyQuest(cloudQuest);
  await pushDailyQuestToCloud();

  // 4. STREAK SHIELD
  const cloudShield = await pullStreakShieldFromCloud();
  mergeStreakShield(cloudShield);

  console.log("[SyncEngine] syncOnAppOpen() complete");
}

// --------------------
// SYNC ON FOREGROUND
// --------------------
export async function syncOnForeground() {
  console.log("[SyncEngine] syncOnForeground()");

  // REVISION
  const cloudRevision = await pullCloudRevision();
  await mergeRevisionData(cloudRevision);
  await pushLocalRevision();

  // PROFILE
  const cloudProfile = await pullProfileFromCloud();
  mergeProfileData(cloudProfile);
  await pushProfileToCloud();

  // DAILY QUEST
  const cloudQuest = await pullDailyQuestFromCloud();
  mergeDailyQuest(cloudQuest);
  await pushDailyQuestToCloud();

  // STREAK SHIELD
  const cloudShield = await pullStreakShieldFromCloud();
  mergeStreakShield(cloudShield);

  console.log("[SyncEngine] syncOnForeground() complete");
}

// --------------------
// FULL SYNC
// --------------------
export async function syncAll() {
  console.log("[SyncEngine] syncAll()");

  const cloudRevision = await pullCloudRevision();
  await mergeRevisionData(cloudRevision);
  await pushLocalRevision();

  const cloudProfile = await pullProfileFromCloud();
  mergeProfileData(cloudProfile);
  await pushProfileToCloud();

  // DAILY QUEST
  const cloudQuest = await pullDailyQuestFromCloud();
  mergeDailyQuest(cloudQuest);
  await pushDailyQuestToCloud();

  // STREAK SHIELD
  const cloudShield = await pullStreakShieldFromCloud();
  mergeStreakShield(cloudShield);

  console.log("[SyncEngine] syncAll() complete");
}

// --------------------
// PROFILE-ONLY SYNC
// --------------------
export async function syncProfileOnly() {
  console.log("[SyncEngine] syncProfileOnly()");

  const cloudProfile = await pullProfileFromCloud();
  mergeProfileData(cloudProfile);
  await pushProfileToCloud();

  console.log("[SyncEngine] syncProfileOnly() complete");
}
