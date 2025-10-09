import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScreenWrapper({ children }) {
  const { pathname } = useLocation();

  // Force manual scroll restoration so browser doesn't "remember" positions
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Smooth scroll-to-top on every route change
  useEffect(() => {
    const el = document.scrollingElement || document.documentElement;

    requestAnimationFrame(() => {
      el.scrollTo({ top: 0, behavior: "smooth" });
      document.body.scrollTo?.({ top: 0, behavior: "smooth" });
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    });

    const t = setTimeout(() => {
      const again = document.scrollingElement || document.documentElement;
      again.scrollTo({ top: 0, behavior: "smooth" });
      document.body.scrollTop = 0;
    }, 80);

    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "16px 16px calc(env(safe-area-inset-bottom) + 30px)",
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
        transition: "opacity 0.3s ease", // soft fade when switching
      }}
    >
      {children}
    </div>
  );
}
