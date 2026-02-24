import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

const HOME_PATHS = new Set(["/", "/home"]);

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitModal, setShowExitModal] = useState(false);

  const isHome = HOME_PATHS.has(location.pathname);
  const isHomeRef = useRef(isHome);
  useEffect(() => { isHomeRef.current = isHome; }, [isHome]);

  const ignoringPopstateRef = useRef(false);

  // --- Web PWA: push a sentinel history entry on first mount ---
  // This ensures pressing back fires popstate (our handler) instead of
  // immediately exiting the PWA. Only needed on web; Capacitor handles
  // Android via its own 'backButton' event.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!window.__iq_sentinel_pushed) {
      window.__iq_sentinel_pushed = true;
      window.history.pushState({ iq_sentinel: true }, "");
    }
  }, []);

  // --- Capacitor Android: hardware / gesture back button ---
  // Fires BEFORE any navigation so we have full control.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle;
    CapacitorApp.addListener("backButton", () => {
      if (isHomeRef.current) {
        setShowExitModal(true);
      } else {
        navigate(-1);
      }
    }).then((h) => { handle = h; });

    return () => { handle?.remove(); };
  }, [navigate]);

  // --- Web PWA: popstate (fires after browser pops a history entry) ---
  // Fires for both browser back button and Android back on web builds.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const handlePopstate = () => {
      // Suppress if we initiated the back ourselves (e.g. user said "Yes, exit")
      if (ignoringPopstateRef.current) {
        ignoringPopstateRef.current = false;
        return;
      }

      if (isHomeRef.current) {
        // Re-push the sentinel so we stay trapped on home.
        // We popped one entry (the previous sentinel), then push a new one —
        // net zero: stack size stays the same, no infinite accumulation.
        window.history.pushState({ iq_sentinel: true }, "");
        setShowExitModal(true);
      }
      // Non-home pages: React Router has already responded to the location
      // change from the popstate event — nothing extra needed here.
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  if (!showExitModal) return null;

  const handleStay = () => setShowExitModal(false);

  const handleExit = () => {
    setShowExitModal(false);
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.minimizeApp();
    } else {
      // Web PWA: jump back 2 entries (sentinel + home) to reach the
      // pre-app history entry, which causes the PWA to close/exit.
      ignoringPopstateRef.current = true;
      window.history.go(-2);
    }
  };

  return (
    <div
      onClick={handleStay}
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

        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "#FFD700",
            margin: "0 0 10px",
          }}
        >
          Exit IslamQuest?
        </h2>

        <p
          style={{
            fontSize: "0.9rem",
            color: "#94a3b8",
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          Your progress is saved. Come back soon, in shā' Allāh.
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
              transition: "background 0.2s",
            }}
            onMouseDown={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
            onMouseUp={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
            onTouchStart={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
            onTouchEnd={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
          >
            Yes, exit
          </button>

          <button
            onClick={handleStay}
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
              transition: "opacity 0.2s",
            }}
            onMouseDown={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseUp={(e) => e.currentTarget.style.opacity = "1"}
            onTouchStart={(e) => e.currentTarget.style.opacity = "0.85"}
            onTouchEnd={(e) => e.currentTarget.style.opacity = "1"}
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
