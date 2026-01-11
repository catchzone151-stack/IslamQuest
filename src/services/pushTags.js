import OneSignal from "onesignal-cordova-plugin";

export const setLastActive = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  OneSignal.User.addTag("last_active_at", timestamp);
};

export const setActivePath = (pathId) => {
  OneSignal.User.addTag("active_path", String(pathId));
};

export const setPathStarted = (pathId) => {
  OneSignal.User.addTag(`path_${pathId}_progress`, "started");
};

export const setPathCompleted = (pathId) => {
  OneSignal.User.addTag(`path_${pathId}_progress`, "completed");
};

export const setStreakActive = (count) => {
  OneSignal.User.addTags({
    streak_active: "true",
    streak_count: String(count),
  });
};

export const setStreakBroken = () => {
  OneSignal.User.addTag("streak_active", "false");
};

export const setChallengePending = (fromUserId) => {
  OneSignal.User.addTags({
    challenge_pending: "true",
    challenge_from: String(fromUserId),
  });
};

export const clearChallengePending = () => {
  OneSignal.User.addTag("challenge_pending", "false");
  OneSignal.User.removeTag("challenge_from");
};
