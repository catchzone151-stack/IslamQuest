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
  currentIqState = { ...currentIqState, ...updates };
  const { streakCount, streakActive, challengePending, challengeFrom } = currentIqState;
  const value = `st=${streakCount}|sa=${streakActive ? 1 : 0}|cp=${challengePending ? 1 : 0}|cf=${challengeFrom || "none"}`;
  OneSignal.User.addTag("iq_state", value);
};

export const setPathStarted = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag("path_state", `${pathId}:started`);
};

export const setPathCompleted = (pathId) => {
  if (!isNative()) return;
  OneSignal.User.addTag("path_state", `${pathId}:completed`);
};
