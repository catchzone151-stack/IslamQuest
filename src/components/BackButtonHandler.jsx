import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

const HOME_PATHS = new Set(["/", "/home"]);
const SENTINEL_KEY = "__iq_sentinel__";

function isHomePath(pathname) {
  return HOME_PATHS.has(pathname);
}

function hasSentinelState() {
  return !!(window.history.state && window.history.state[SENTINEL_KEY]);
}

function pushSentinel() {
  // Preserve existing state (some routers use it)
  const prev = window.history.state || {};
  if (prev && prev[SENTINEL_KEY]) return; // already sentinel at top
  window.history.pushState({ ...prev, [SENTINEL_KEY]: true }, "");
}

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitModal, setShowExitModal] = useState(false);

  const isHome = isHomePath(location.pathname);
  const isHomeRef = useRef(isHome);
  useEffect(() => {
    isHomeRef.current = isHome;
  }, [isHome]);

  // Ignore multiple popstates triggered by our own exit attempts
  const ignorePopCountRef = useRef(0);

  // --- Web PWA: ensure we have a sentinel behind the app history ---
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    // In dev StrictMode, this effect can run twice. Sentinel check prevents duplication.
    if (!hasSentinelState()) {
      pushSentinel();
    }
  }, []);

  // --- Capacitor Android: hardware back ---
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle;
    CapacitorApp.addListener("backButton", () => {
      if (isHomeRef.current) {
        setShowExitModal(true);
      } else {
        navigate(-1);
      }
    }).then((h) => {
      handle = h;
    });

    return () => {
      handle?.remove();
    };
  }, [navigate]);

  // --- Web PWA: popstate handling ---
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const onPopState = () => {
      if (ignorePopCountRef.current > 0) {
        ignorePopCountRef.current -= 1;
        return;
      }

      if (isHomeRef.current) {
        // Trap leaving the app from home:
        // re-push sentinel so user stays in app, then show modal.
        pushSentinel();
        setShowExitModal(true);
      }
      // Non-home: let React Router handle it naturally.
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // ESC closes modal (web + native keyboards)
  useEffect(() => {
    if (!showExitModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowExitModal(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showExitModal]);

  if (!showExitModal) return null;

  const handleStay = () => setShowExitModal(false);

  const handleExit = () => {
    setShowExitModal(false);

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.minimizeApp();
      return;
    }

    // Web PWA “exit” is not reliably possible; best effort:
    // Try to go back a couple steps, but don’t assume -2 always exists.
    // We ignore up to 2 popstates triggered by our own go().
    const len = window.history.length;

    if (len <= 2) {
      // Nothing meaningful to go back to; just close modal.
      // (This is the correct behavior for many standalone PWAs.)
      return;
    }

    ignorePopCountRef.current = 2;
    window.history.go(-2);
  };

  return (
    <div
      onClick={handleStay}
      role="dialog"
      aria-modal="true"
      aria-label="Exit app confirmation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0a2a43 0%, #000814 100%)",
          border: "2px solid rgba(255, 215, 0, 0.35)",
          borderRadius: 24,
          padding: "32px 28px",
          width: "min(340px, 88vw)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 32px rgba(255,215,0,0.12)",
          textAlign: "center",
          animation: "iqExitModalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>🚪</div>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFD700", margin: "0 0 10px" }}>
          Exit IslamQuest?
        </h2>

        <p style={{ fontSize: "0.9rem", color: "#94a3b8", margin: "0 0 28px", lineHeight: 1.5 }}>
          Your progress is saved. Come back soon, in shā&apos; Allāh.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleExit}
            style={{
              width: "100%",
              padding: "14px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: 14,
              color: "#ef4444",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Yes, exit
          </button>

          <button
            onClick={handleStay}
            autoFocus
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #FFD700 0%, #b89600 100%)",
              border: "none",
              borderRadius: 14,
              color: "#000814",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,215,0,0.35)",
            }}
          >
            Stay
          </button>
        </div>
      </div>

      <style>{`
        @keyframes iqExitModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}