import { useProgressStore } from "../store/progressStore";

export function useVibration() {
  const vibrationEnabled = useProgressStore((state) => state.vibrationEnabled);

  const vibrate = (pattern) => {
    if (!vibrationEnabled) return;
    
    // Desktop fallback for testing
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn("Vibration API not available:", e);
      }
    } else {
      // Desktop fallback: log to console
      console.log("HAPTIC (desktop fallback): vibrate", pattern);
    }
  };

  return { vibrate, vibrationEnabled };
}
