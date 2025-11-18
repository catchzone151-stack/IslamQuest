/**
 * IslamQuest — Home Screen (Premium Polished Build, Updated for 14 Paths)
 * ---------------------------------------------------------------------------
 * This file preserves your full visual design, styling, layout, glow,
 * animations, header, mascot, Daily Quest card, carousel, dev slider,
 * etc. Nothing in the look/feel is removed.
 *
 * Changes in this version:
 *
 * 1) Uses `paths` from progressStore.js (14 unlocked learning paths).
 * 2) All paths are clickable (status: "available" assumed for launch).
 * 3) Each path card has its own gradient background (on-theme).
 * 4) Progress bar:
 *    - Gradient gold fill
 *    - Uses `p.progress` from store (0–1)
 *    - Shows `completedLessons / totalLessons Lessons`
 *    - Soft gold pulse glow when full (progress >= 1).
 * 5) Daily Quest uses triggerDailyStudy() from store.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { useDailyQuestStore } from "../store/dailyQuestStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";

// Components
import DailyQuestCard from "../components/dailyquest/DailyQuestCard";

// Mascots & UI assets
import Zayd from "../assets/mascots/mascot_zayd_default.webp";
import ZaydChallenge from "../assets/mascots/mascot_zayd_challenge.webp";
import MainMascot from "../assets/mascots/mascot_zayd_happy.webp";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_shield from "../assets/ui/ui_shield.webp";

export default function Home() {
  // Navigation
  const navigate = useNavigate();
  const { name } = useUserStore();

  // Horizontal scroll ref for the learning path cards
  const carouselRef = useRef(null);

  // Which "page" of the carousel we're on (0 / 1 / 2)
  const [page, setPage] = useState(0);

  // Modal store
  const { showModal } = useModalStore();

  // Pull live data from the store
  const {
    xp,
    coins,
    streak,
    shieldCount,
    needsRepairPrompt,
    paths,
    triggerDailyStudy,
    checkStreakOnAppOpen,
  } = useProgressStore();

  // Load Daily Quest state from localStorage on mount
  const { loadDailyQuest } = useDailyQuestStore();
  useEffect(() => {
    loadDailyQuest();
  }, [loadDailyQuest]);

  // Check streak status on mount and show repair modal if needed
  useEffect(() => {
    checkStreakOnAppOpen();
  }, [checkStreakOnAppOpen]);

  // Show repair modal if needed
  useEffect(() => {
    if (needsRepairPrompt) {
      showModal(MODAL_TYPES.REPAIR_STREAK);
    }
  }, [needsRepairPrompt, showModal]);

  /**
   * Sync carousel scroll -> page indicator dots
   */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      const newPage = ratio < 0.33 ? 0 : ratio < 0.66 ? 1 : 2;
      if (newPage !== page) {
        setPage(newPage);
      }
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [page]);

  /**
   * Programmatically scroll the carousel to a page index (0,1,2)
   * Used by the page dots + dev slider buttons
   */
  const goToPage = (i) => {
    const el = carouselRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const stops = [0, Math.round(max / 2), max]; // 3 logical stops
    const idx = Math.max(0, Math.min(2, i));
    el.scrollTo({ left: stops[idx], behavior: "smooth" });
    setPage(idx);
  };

  /**
   * On click of a path card:
   * - All paths are unlocked/available for launch
   * - Navigate to /pathway/:id
   */
  const handlePathClick = (p) => {
    navigate(`/path/${p.id}`);
  };

  /**
   * Card gradients — one per learning path (index-based)
   * Order aligns with your 14 paths in progressStore.
   */
  const gradients = [
    "linear-gradient(145deg, #e8c87e, #d4a74f)", // Names of Allah
    "linear-gradient(145deg, #2a5298, #1e3c72)", // Foundations of Islam
    "linear-gradient(145deg, #ff758c, #ff7eb3)", // Stories of Prophets
    "linear-gradient(145deg, #00a859, #004d26)", // Life of Muhammad ﷺ
    "linear-gradient(145deg, #cc6600, #663300)", // Wives of the Prophet ﷺ
    "linear-gradient(145deg, #d91e36, #60001a)", // Ten Promised Jannah
    "linear-gradient(145deg, #9c27b0, #3e0069)", // Four Greatest Women
    "linear-gradient(145deg, #26c6da, #004d66)", // Stories of the Companions
    "linear-gradient(145deg, #ff9800, #7a3600)", // Angels and Jinns
    "linear-gradient(145deg, #607d8b, #1a252f)", // The End Times
    "linear-gradient(145deg, #6a11cb, #2575fc)", // The Grave
    "linear-gradient(145deg, #2e8b57, #0d2614)", // Day of Judgement
    "linear-gradient(145deg, #b31217, #240b36)", // Hellfire
    "linear-gradient(145deg, #f7971e, #ffd200)", // Paradise
  ];

  return (
    <div
      className="page-transition"
      style={{
        minHeight: "100vh",
        background: "#0e2340",
        color: "white",
        padding: 16,
        paddingBottom: 80,
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/*
       * ===============================================================
       * HEADER BAR
       * ===============================================================
       */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: 8,
          columnGap: 8,
        }}
      >
        {/* Left cluster: Streak + XP */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[
            { icon: ui_streak, label: "Streak", value: streak },
            { icon: ui_xp, label: "XP", value: xp },
          ].map(({ icon, value }, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 40,
              }}
            >
              <img
                src={icon}
                alt={i === 0 ? "Streak" : "XP"}
                loading="eager"
                style={{ width: 40, height: 40 }}
              />
              <span
                style={{
                  marginTop: 4,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#ffd85a",
                }}
              >
                {typeof value === "number" ? value.toLocaleString() : value}
              </span>
            </div>
          ))}
        </div>

        {/* Center mascot */}
        <div style={{ textAlign: "center" }}>
          <img
            src={MainMascot}
            alt="Main Mascot"
            loading="eager"
            style={{
              width: 100,
              height: 100,
              display: "block",
              margin: "0 auto",
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          />
        </div>

        {/* Right cluster: Coins + Shield */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          {/* Coins */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img src={ui_coin} alt="Coins" loading="eager" style={{ width: 40, height: 40 }} />
            <span
              style={{
                marginTop: 4,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "gold",
              }}
            >
              {typeof coins === "number" ? coins.toLocaleString() : coins}
            </span>
          </div>

          {/* Streak Freeze Shield */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={ui_shield}
              alt="Shield"
              loading="eager"
              title="Streak Freeze"
              onClick={() => showModal(MODAL_TYPES.PURCHASE_STREAK_FREEZE)}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "2px solid gold",
                padding: 4,
                background: "rgba(0, 102, 204, 0.2)",
                boxShadow: "0 0 14px rgba(255,215,0,0.7)",
                animation: "shieldGlow 2.5s ease-in-out infinite alternate",
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.92)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1.07)";
              }}
            />
            <span
              style={{
                marginTop: 4,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#4fd5ff",
                textShadow: "0 2px 4px rgba(0,0,0,0.55)",
              }}
            >
              {shieldCount}
            </span>
          </div>
        </div>
      </div>

      {/*
       * ===============================================================
       * TITLE + SMALL GREETING
       * ===============================================================
       */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h1
          className="title-shimmer"
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        >
          IslamQuest
        </h1>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.15rem",
          margin: "6px 0 14px",
          fontFamily: "'Amiri', 'Georgia', serif",
          fontWeight: "500",
          color: "#FFD700",
          textShadow: "0 2px 8px rgba(212, 175, 55, 0.4)",
          letterSpacing: "0.5px",
        }}
      >
        As salaam 'alaikum, {name || "Explorer"} 👋
      </p>

      {/*
       * ===============================================================
       * DAILY QUEST CARD
       * ===============================================================
       */}
      <DailyQuestCard />

      {/*
       * ===============================================================
       * LEARNING PATHS CAROUSEL
       * ===============================================================
       */}
      <div style={{ position: "relative", padding: "0 0 12px" }}>
        <div
          ref={carouselRef}
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 14,
            paddingBottom: 8,
            scrollBehavior: "smooth",
          }}
        >
          {paths.map((p, index) => {
            const gradient =
              gradients[index] || gradients[index % gradients.length];
            const progress = typeof p.progress === "number" ? p.progress : 0;
            const percent = Math.min(100, Math.max(0, progress * 100));
            const completed = p.completedLessons || 0;
            const total = p.totalLessons || 0;
            const isFull = total > 0 && completed >= total;


            return (
              <div
                key={p.id}
                onClick={() => handlePathClick(p)}
                style={{
                  minWidth: 160,
                  height: 230,
                  background: gradient,
                  borderRadius: 18,
                  position: "relative",
                  color: "#fff",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {/* Title of the path */}
                <h3
                  style={{
                    margin: "10px 0 4px",
                    fontSize: "1.05rem",
                  }}
                >
                  {p.title}
                </h3>

                {/* Gradient Progress Bar */}
                <div
                  style={{
                    height: 10,
                    width: "65%",
                    background: "#0a1a2f",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 6,
                    boxShadow: isFull
                      ? "0 0 16px rgba(255,215,0,0.6)"
                      : "inset 0 0 4px rgba(255,255,255,0.3)",
                    animation: isFull
                      ? "barPulse 3s ease-in-out infinite"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #ffd85a, #ffb700)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Lesson Counter */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#e8e8e8",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {completed} / {total} Lessons
                </div>

                {/* Paw print badge, pulsing */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 18,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255,215,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pawPulse 2.2s infinite ease-in-out",
                  }}
                >
                  <span style={{ fontSize: 22 }}>🐾</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*
       * ===============================================================
       * PAGE DOTS
       * ===============================================================
       */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            onClick={() => goToPage(i)}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: i === page ? "gold" : "#555",
              boxShadow: i === page ? "0 0 10px gold" : "none",
              transform: i === page ? "scale(1.3)" : "scale(1)",
              transition: "all 0.25s ease",
              margin: "0 6px",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/*
       * ===============================================================
       * DEV SLIDER / TEST NAV CONTROL
       * ===============================================================
       */}
      <div
        style={{
          maxWidth: 360,
          margin: "0 auto 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <button
          onClick={() => goToPage(Math.max(0, page - 1))}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
          }}
        >
          ◀
        </button>

        <input
          type="range"
          min="0"
          max="2"
          value={page}
          onChange={(e) => goToPage(Number(e.target.value))}
          style={{ flex: 1 }}
        />

        <button
          onClick={() => goToPage(Math.min(2, page + 1))}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
          }}
        >
          ▶
        </button>
      </div>

      {/*
       * ===============================================================
       * INLINE CSS (keyframes, shimmer, pulses, glow)
       * ===============================================================
       */}
      <style>{`
        .title-shimmer {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
          color: gold;
        }

        .page-transition {
          animation: fadeSlideIn 520ms cubic-bezier(.16,.84,.44,1) both;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounceYSmooth {
          0% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-12px) scale(1.02); }
          50% { transform: translateY(-6px) scale(1.01); }
          75% { transform: translateY(-2px) scale(1.005); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes pawPulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }

        @keyframes barPulse {
          0% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
          50% { box-shadow: 0 0 22px rgba(255,215,0,0.8); }
          100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
        }

        @keyframes shieldGlow {
          0% { box-shadow: 0 0 14px rgba(255,215,0,0.6); }
          100% { box-shadow: 0 0 24px rgba(255,215,0,0.9); }
        }

        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,215,0,0.6);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }

        html, body, * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: geometricPrecision;
        }

        * {
          image-rendering: -webkit-optimize-contrast;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
