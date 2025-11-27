import { logEvent, ANALYTICS_EVENTS } from "../services/analyticsService";

export { ANALYTICS_EVENTS };

export const useAnalytics = () => {
  return logEvent;
};
