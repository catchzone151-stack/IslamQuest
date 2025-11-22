import { useProgressStore } from "../store/progressStore";

export function useVibration() {
  const vibrationEnabled = useProgressStore((state) => state.vibrationEnabled);

  const vibrate = (pattern) => {
    if (!vibrationEnabled) return;
    if (!navigator.vibrate) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Vibration API not available:", e);
    }
  };

  return { vibrate, vibrationEnabled };
}
