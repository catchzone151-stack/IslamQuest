/**
 * ScrollToTop.jsx (robust)
 * Forces manual scroll restoration and scrolls to top on every route change.
 * Works with HashRouter and across browsers (Safari/Chrome/iframe quirks).
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  // 1) Disable browser's automatic scroll restoration (so our logic wins)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        // restore previous mode if this component ever unmounts
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  // 2) On any route change, scroll the correct scrolling element to top
  useEffect(() => {
    // Primary scrolling element in modern browsers
    const el = document.scrollingElement || document.documentElement;

    // Try smooth; if it throws (older engines), fall back to instant
    try {
      // Use rAF to ensure it runs after the new route paints
      requestAnimationFrame(() => {
        el.scrollTo({ top: 0, behavior: "smooth" });
        // Also set both roots for Safari/quirky engines
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    } catch {
      // Fallback for any engines without smooth behavior support
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    // Depend on all parts that can change with HashRouter
  }, [location.key, location.pathname, location.search, location.hash]);

  return null;
}
