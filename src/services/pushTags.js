import OneSignal from "onesignal-cordova-plugin";
import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

let _getProgressState = null;

export const registerProgressStore = (getStateFn) => {
  _getProgressState = getStateFn;
};

let currentIqState = {
  streakCount: 0,
  streakActive: false,
  challengePending: false,
  challengeFrom: null,
};

const getStateCode = (streakActive, challengePending) => {
  if (streakActive && challengePending) return "AS_CP";
  if (streakActive) return "AS";
  if (challengePending) return "NS_CP";
  return "NS";
};

export const setIqState = (updates) => {
  console.log("[PUSH_TAG_SYNC] setIqState called", { updates, isNative: isNative() });
  if (!isNative()) return;
  const prevChallengePending = currentIqState.challengePending;
  currentIqState = { ...currentIqState, ...updates };
  const { streakActive, challengePending } = currentIqState;
  const value = getStateCode(streakActive, challengePending);
  console.log("[PUSH_TAG_SYNC] iq_state about to update", value);
  OneSignal.User.addTag("iq_state", value);
  console.log('[IQ_PUSH_TRACE]', 'IQ_STATE_SENT', {
    iq_state: value,
    ts: new Date().toISOString()
  });

  if (updates.challengePending !== undefined && updates.challengePending !== prevChallengePending) {
    console.log(`[PUSH_TAG_SYNC] challenge pending=${challengePending ? 1 : 0}`);
  }
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

    const streakCount = state?.streak ?? 0;
    const streakActive = streakCount > 0;

    const prevStreakActive = currentIqState.streakActive;
    currentIqState = { ...currentIqState, streakCount, streakActive };
    const { challengePending } = currentIqState;
    const value = getStateCode(streakActive, challengePending);

    OneSignal.User.addTag("iq_state", value);
    console.log('[IQ_PUSH_TRACE]', 'IQ_STATE_SENT', {
      iq_state: value,
      ts: new Date().toISOString()
    });

    console.log(`PUSH_TAG_SYNC [${reason}] iq_state=${value}`);

    if (streakActive !== prevStreakActive) {
      console.log(`[PUSH_TAG_SYNC] streak sa=${streakActive ? 1 : 0}`);
    }
  } catch (err) {
    console.warn(`PUSH_TAG_SYNC [${reason}] failed:`, err.message);
  }
};

export const setPathStarted = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag("path_state", `${pathId}:started`);
};

export const setPathCompleted = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag("path_state", `${pathId}:completed`);
};
