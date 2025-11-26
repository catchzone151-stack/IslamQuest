import { pullCloudRevision, pushLocalRevision, mergeRevisionData } from "./revisionSync.js";

export async function syncOnAppOpen() {
  console.log("[SyncEngine] syncOnAppOpen() called");

  // 1. Pull cloud
  const cloudItems = await pullCloudRevision();

  // 2. Merge (future)
  await mergeRevisionData(cloudItems);

  // 3. Push local
  await pushLocalRevision();

  console.log("[SyncEngine] syncOnAppOpen() complete");
}

export async function syncOnForeground() {
  console.log("[SyncEngine] syncOnForeground() called");

  const cloudItems = await pullCloudRevision();
  await mergeRevisionData(cloudItems);
  await pushLocalRevision();

  console.log("[SyncEngine] syncOnForeground() complete");
}

export async function syncAll() {
  console.log("[SyncEngine] syncAll() called");

  const cloudItems = await pullCloudRevision();
  await mergeRevisionData(cloudItems);
  await pushLocalRevision();

  console.log("[SyncEngine] syncAll() complete");
}

export async function syncRevisionOnly() {
  console.log("[SyncEngine] syncRevisionOnly() called");

  const cloudItems = await pullCloudRevision();
  await mergeRevisionData(cloudItems);
  await pushLocalRevision();

  console.log("[SyncEngine] syncRevisionOnly() complete");
}
