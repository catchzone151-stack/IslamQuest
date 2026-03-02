import OneSignal from "onesignal-cordova-plugin";
import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

let _getProgressState = null;
let _challengePending = false;

export const registerProgressStore = (getStateFn) => {
  _getProgressState = getStateFn;
};

export const setChallengePending = (pending) => {
  _challengePending = Boolean(pending);
  syncStreakTags("challenge_state_change");
};

export const syncStreakTags = (reason = "unknown") => {
  console.log("[PUSH_TAG_SYNC] syncStreakTags called", { reason, isNative: isNative() });
  if (!isNative()) return;

  try {
    const state = _getProgressState ? _getProgressState() : null;
    if (!state) {
      console.warn(`PUSH_TAG_SYNC [${reason}] failed: progressStore not registered`);
      return;
    }

    const streak = state?.streak ?? 0;
    const lastStreakDate = state?.lastStreakDate ?? null;

    const todayStr = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time

    let streakStatus;
    if (streak === 0) {
      streakStatus = "no_streak";
    } else if (lastStreakDate === todayStr) {
      streakStatus = "on_track";
    } else {
      streakStatus = "at_risk";
    }

    const challengeTag = _challengePending ? "true" : "false";

    OneSignal.User.addTag("streak_status", streakStatus);
    OneSignal.User.addTag("challenge_pending", challengeTag);

    console.log(`[PUSH_TAG_SYNC] [${reason}] streak_status=${streakStatus} challenge_pending=${challengeTag}`);
  } catch (err) {
    console.warn(`PUSH_TAG_SYNC [${reason}] failed:`, err.message);
  }
};
