import OneSignal from "onesignal-cordova-plugin";
import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

export const setLastActive = () => {
  if (!isNative()) return;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  OneSignal.User.addTag("last_active_at", timestamp);
};

export const setActivePath = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag("active_path", String(pathId));
};

export const setPathStarted = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag(`path_${pathId}_progress`, "started");
};

export const setPathCompleted = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag(`path_${pathId}_progress`, "completed");
};

export const setStreakActive = (count) => {
  if (!isNative()) return;
  OneSignal.User.addTags({
    streak_active: "true",
    streak_count: String(count),
  });
};

export const setStreakBroken = () => {
  if (!isNative()) return;
  OneSignal.User.addTag("streak_active", "false");
};

export const setChallengePending = (fromUserId) => {
  if (!isNative()) return;
  OneSignal.User.addTags({
    challenge_pending: "true",
    challenge_from: String(fromUserId),
  });
};

export const clearChallengePending = () => {
  if (!isNative()) return;
  OneSignal.User.addTag("challenge_pending", "false");
  OneSignal.User.removeTag("challenge_from");
};
