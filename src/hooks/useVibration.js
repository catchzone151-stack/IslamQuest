import { useProgressStore } from "../store/progressStore";

export function useVibration() {
  const vibrationEnabled = useProgressStore((state) => state.vibrationEnabled);

  const vibrate = (pattern) => {
    if (!vibrationEnabled) return;
    
    try {
      // Check for vibration API (standard and webkit prefixed)
      const vibrationAPI = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
      
      if (vibrationAPI) {
        // Call on navigator object to maintain context
        if (navigator.vibrate) {
          navigator.vibrate(pattern);
        } else if (navigator.webkitVibrate) {
          navigator.webkitVibrate(pattern);
        } else if (navigator.mozVibrate) {
          navigator.mozVibrate(pattern);
        } else if (navigator.msVibrate) {
          navigator.msVibrate(pattern);
        }
      }
    } catch (e) {
      // Silently fail - vibration API may not be available on all devices
    }
  };

  return { vibrate, vibrationEnabled };
}
