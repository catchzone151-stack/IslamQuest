import OneSignal from "onesignal-cordova-plugin";
import { Capacitor } from "@capacitor/core";

const isNative = () => Capacitor.isNativePlatform();

let currentIqState = {
  streakCount: 0,
  streakActive: false,
  challengePending: false,
  challengeFrom: null,
};

export const setIqState = (updates) => {
  if (!isNative()) return;
  const prevChallengePending = currentIqState.challengePending;
  currentIqState = { ...currentIqState, ...updates };
  const { streakCount, streakActive, challengePending, challengeFrom } = currentIqState;
  const value = `st=${streakCount}|sa=${streakActive ? 1 : 0}|cp=${challengePending ? 1 : 0}|cf=${challengeFrom || "none"}`;
  OneSignal.User.addTag("iq_state", value);
  
  if (updates.challengePending !== undefined && updates.challengePending !== prevChallengePending) {
    console.log(`[PUSH_TAG_SYNC] challenge pending=${challengePending ? 1 : 0}`);
  }
};

export const syncStreakTags = (reason = "unknown") => {
  if (!isNative()) return;
  
  try {
    const { useProgressStore } = require("../store/progressStore");
    const state = useProgressStore.getState();
    
    const streakCount = state?.streak ?? 0;
    const lastStudyDate = state?.lastStudyDate;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streakActive = lastStudyDate === today || lastStudyDate === yesterday;
    
    const prevStreakActive = currentIqState.streakActive;
    currentIqState = { ...currentIqState, streakCount, streakActive };
    const { challengePending, challengeFrom } = currentIqState;
    const value = `st=${streakCount}|sa=${streakActive ? 1 : 0}|cp=${challengePending ? 1 : 0}|cf=${challengeFrom || "none"}`;
    
    OneSignal.User.addTag("iq_state", value);
    
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
