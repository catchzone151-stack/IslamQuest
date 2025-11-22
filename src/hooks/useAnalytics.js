// src/hooks/useAnalytics.js
// Lightweight analytics hook - currently logs to console, ready for Supabase/analytics service
// Event names should be lowercase_with_underscores (snake_case)

export const useAnalytics = () => {
  const logEvent = (eventName, payload = {}) => {
    const timestamp = new Date().toISOString();
    const event = {
      timestamp,
      event: eventName,
      payload,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, payload);
    }

    // TODO: Send to analytics service (Supabase, Firebase, etc)
    // Example:
    // supabase.from('analytics_events').insert([event]);

    return event;
  };

  return logEvent;
};
