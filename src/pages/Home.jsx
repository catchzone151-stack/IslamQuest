/**
 * IslamQuest — Home Screen (Premium Polished Build)
 * ---------------------------------------------------------------------------
 * This is the canonical, full-length Home.jsx file that preserves ALL of your
 * original visuals, animations, and layout — with the following refinements:
 *
 * 1) Bottom spacing fix:
 *    - Prevents the large blank gap above the fixed BottomNav by replacing the
 *      hardcoded paddingBottom (90px) with a safe, dynamic value:
 *      `calc(env(safe-area-inset-bottom) + 30px)`.
 *
 * 2) Premium page transition:
 *    - A gentle fade + upward slide on mount (Duolingo-soft feel).
 *    - Done via the .page-transition class and keyframes below.
 *
 * 3) Lion (Daily Quest) bounce tempo:
 *    - Slowed from 1.6s → 2.25s for a calmer, more premium animation rhythm.
 *    - Uses custom easing to feel natural, playful, and less “jittery.”
 *
 * 4) Dev slider:
 *    - Kept as-is and visible (by request) for QA during development.
 *
 * Everything else — gradients, shimmer, shield glow, paw pulse, progress bars,
 * learning path layout, and click-test handlers (XP +10, Coins +5, Streak +1)
 * — remains intact and unchanged in spirit.
 * ---------------------------------------------------------------------------
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Global store (local persistence for now; Supabase-ready later)
import { useGameStore } from "../lib/store";

// Assets — mascots & UI
import Zayd from "../assets/mascots/mascot_zayd_default.webp";
import ZaydChallenge from "../assets/mascots/mascot_zayd_challenge.webp";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_shield from "../assets/ui/ui_shield.webp";

/* ----------------------------------------------------------------------------
 * Component: Home
 * ----------------------------------------------------------------------------
 */
export default function Home() {
  // Router + refs
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // Carousel pagination (0..2)
  const [page, setPage] = useState(0);

  // Live game stats (local store)
  const { xp, coins, streak, addXp, addCoins, incrementStreak } =
    useGameStore();

  // Canonical learning paths (6 unlocked + 6 locked)
  const unlocked = [
    { id: 1, title: "Names of Allah", progress: 0.35 },
    { id: 2, title: "Six Pillars of Belief", progress: 0.2 },
    { id: 3, title: "Stories of Prophets", progress: 0.1 },
    { id: 4, title: "Life of Muhammad ﷺ", progress: 0 },
    { id: 5, title: "Ten Promised Paradise", progress: 0 },
    { id: 6, title: "Four Greatest Women", progress: 0 },
  ];
  const locked = [
    { id: 7, title: "Minor Signs" },
    { id: 8, title: "Major Signs" },
    { id: 9, title: "The Grave" },
    { id: 10, title: "Day of Judgement" },
    { id: 11, title: "Hellfire" },
    { id: 12, title: "Paradise" },
  ];
  const learningPaths = [
    ...unlocked.map((p) => ({ ...p, locked: false })),
    ...locked.map((p) => ({ ...p, locked: true })),
  ];

  /* --------------------------------------------------------------------------
   * Pagination — robust page detection for a 3-page horizontal carousel
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      const newPage = ratio < 0.33 ? 0 : ratio < 0.66 ? 1 : 2;
      if (newPage !== page) setPage(newPage);
    };

    onScroll(); // initialize
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [page]);

  /* --------------------------------------------------------------------------
   * Dev helper: programmatically move the carousel to a page (0,1,2)
   * ------------------------------------------------------------------------ */
  const goToPage = (i) => {
    const el = carouselRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const targets = [0, Math.round(max / 2), max]; // 3 logical stops
    const clamped = Math.max(0, Math.min(2, i));
    el.scrollTo({ left: targets[clamped], behavior: "smooth" });
    setPage(clamped);
  };

  /* --------------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------------ */
  return (
    <div
      className="page-transition" // ✨ premium fade + slight upward slide
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
        padding: 16,

        // 🩹 Bottom spacing fix — avoid large blank gap above BottomNav
        // Leaves a comfortable cushion for glow/shadows and safe-area insets.
        paddingBottom: "calc(env(safe-area-inset-bottom) + 30px)",

        overflowX: "hidden",
      }}
    >
      {/* --------------------------------------------------------------------
       * HEADER
       * ------------------------------------------------------------------ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: 8,
          columnGap: 8,
        }}
      >
        {/* Left counters (streak + XP) — tap actions preserved */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[
            {
              icon: ui_streak,
              value: streak,
              onClick: () => incrementStreak(),
            }, // 🔥 +1 day
            { icon: ui_xp, value: xp, onClick: () => addXp(10) }, // ⭐ +10 XP
          ].map(({ icon, value, onClick }, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={icon}
                alt="Icon"
                style={{
                  width: 40,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.45))",
                }}
                onClick={onClick}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.92)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1.15)")
                }
              />
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-7px",
                  background: "#222",
                  padding: "0 4px",
                  borderRadius: 8,
                  fontSize: "0.7rem",
                  color: "gold",
                  fontWeight: "bold",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Center — Mascot (static on Home header; bouncing version is in Daily Quest) */}
        <div style={{ textAlign: "center" }}>
          <img
            src={Zayd}
            alt="Zayd Mascot"
            style={{
              width: 85,
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>

        {/* Right counters (coins + shield) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          {/* Coins — tap to add +5 (for dev/demo) */}
          <div style={{ position: "relative" }}>
            <img
              src={ui_coin}
              alt="Coins"
              style={{
                width: 40,
                cursor: "pointer",
                transition: "transform 0.2s ease",
                filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.45))",
              }}
              onClick={() => addCoins(5)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.92)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1.15)")
              }
            />
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-7px",
                background: "#222",
                padding: "0 4px",
                borderRadius: 8,
                fontSize: "0.7rem",
                color: "gold",
                fontWeight: "bold",
              }}
            >
              {coins}
            </span>
          </div>

          {/* Shield — shimmer only, no stat change (shop teaser) */}
          <div style={{ position: "relative" }}>
            <img
              src={ui_shield}
              alt="Shield"
              title="Shield Shop"
              onClick={() => alert("Shield shop coming soon")}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.07)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.92)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1.07)")
              }
            />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
       * TITLE
       * ------------------------------------------------------------------ */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h1 className="title-shimmer">IslamQuest</h1>
      </div>

      {/* --------------------------------------------------------------------
       * GREETING
       * ------------------------------------------------------------------ */}
      <p
        style={{
          textAlign: "center",
          fontSize: "1.05rem",
          margin: "6px 0 14px",
        }}
      >
        As-salāmu ʿalaykum, Explorer 👋
      </p>

      {/* --------------------------------------------------------------------
       * DAILY QUEST — Zayd (animated)
       *  - Slowed the bounce to 2.25s with a softer ease.
       * ------------------------------------------------------------------ */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(0,255,209,0.3), rgba(255,215,0,0.3))",
          borderRadius: 18,
          padding: 16,
          margin: "6px 0 18px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          boxShadow: "0 0 15px rgba(0,255,209,0.4)",
          animation: "dqPulse 3s infinite ease-in-out",
        }}
      >
        <div>
          <h3 style={{ color: "gold", margin: "0 0 6px" }}>Daily Quest</h3>
          <p style={{ margin: 0, color: "#e6f7ff" }}>
            Earn XP with today’s mini challenge!
          </p>
          <button
            onClick={() => {
              incrementStreak(); // 🔥 +1 streak on entering challenge
              navigate("/challenge");
            }}
            style={{
              marginTop: 10,
              background: "gold",
              border: "none",
              padding: "10px 18px",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffdd33")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "gold")}
          >
            Let’s Go!
          </button>
        </div>

        {/* 🦁 Slower, premium bounce */}
        <img
          src={ZaydChallenge}
          alt="Zayd Challenge"
          style={{
            width: 80,
            height: "auto",
            marginLeft: 10,
            animation:
              "bounceYSmooth 2.25s cubic-bezier(.22,.61,.36,1) infinite",
            transformOrigin: "50% 90%",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
          }}
        />
      </div>

      {/* --------------------------------------------------------------------
       * LEARNING PATHS — with paw pulse
       * ------------------------------------------------------------------ */}
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
          {learningPaths.map((p) => (
            <div
              key={p.id}
              onClick={() =>
                !p.locked
                  ? navigate(`/pathway/aqeedah-pillars`)
                  : alert(`${p.title} coming soon!`)
              }
              style={{
                minWidth: 160,
                height: 230,
                background: p.locked
                  ? "linear-gradient(145deg, #1a1a1a, #2a2a2a)"
                  : "linear-gradient(145deg, #006d9c, #00a0c8)",
                borderRadius: 18,
                position: "relative",
                boxShadow: p.locked
                  ? "0 0 10px rgba(150,150,150,0.4)"
                  : "0 0 18px rgba(0,255,255,0.25)",
                color: "#fff",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: p.locked ? "default" : "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <h3 style={{ margin: "10px 0 4px", fontSize: "1.05rem" }}>
                {p.title}
              </h3>

              {!p.locked ? (
                <div
                  style={{
                    height: 8,
                    width: "60%",
                    background: "#0a1a2f",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      width: `${p.progress * 100}%`,
                      height: "100%",
                      background: "gold",
                    }}
                  />
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#bbb",
                    marginTop: 6,
                    animation: "soonGlow 2.8s infinite ease-in-out",
                  }}
                >
                  Coming soon, in shā’ Allāh
                </p>
              )}

              {/* Paw print badge */}
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
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------------
       * Pagination Dots (3)
       * ------------------------------------------------------------------ */}
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

      {/* --------------------------------------------------------------------
       * Dev slider — kept visible for testing throughout development
       * ------------------------------------------------------------------ */}
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

      {/* --------------------------------------------------------------------
       * Inline CSS (scoped to this screen; safe for Vite)
       * ------------------------------------------------------------------ */}
      <style>
        {`
          /* --------------------------------------------------------------
           * Heading shimmer
           * ------------------------------------------------------------ */
          .title-shimmer {
            font-size: 1.8rem;
            font-weight: 800;
            margin: 0;
            background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200%;
            animation: shimmer 8s linear infinite;
          }
          @keyframes shimmer {
            0%   { background-position: 0%   50%; }
            100% { background-position: 200% 50%; }
          }

          /* --------------------------------------------------------------
           * Shield glow (unchanged)
           * ------------------------------------------------------------ */
          @keyframes shieldGlow {
            from { filter: drop-shadow(0 0 6px rgba(0,255,255,0.6)); }
            to   { filter: drop-shadow(0 0 16px rgba(0,255,255,1)); }
          }

          /* --------------------------------------------------------------
           * Daily Quest card pulse (unchanged)
           * ------------------------------------------------------------ */
          @keyframes dqPulse {
            0%,100% { box-shadow: 0 0 10px rgba(0,255,209,0.3); }
            50%     { box-shadow: 0 0 22px rgba(255,215,0,0.45); }
          }

          /* --------------------------------------------------------------
           * Lion bounce — slowed + softened
           *  - Old: bounceY 1.6s ease-in-out
           *  - New: bounceYSmooth 2.25s cubic-bezier(.22,.61,.36,1)
           * ------------------------------------------------------------ */
          @keyframes bounceYSmooth {
            0%   { transform: translateY(0)    scale(1);   }
            25%  { transform: translateY(-12px) scale(1.02);}
            50%  { transform: translateY(-6px)  scale(1.01);}
            75%  { transform: translateY(-2px)  scale(1.005);}
            100% { transform: translateY(0)     scale(1);   }
          }

          /* --------------------------------------------------------------
           * Paw pulse (unchanged)
           * ------------------------------------------------------------ */
          @keyframes pawPulse {
            0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 8px gold);  }
            50%      { transform: scale(1.2); filter: drop-shadow(0 0 18px gold); }
          }

          /* --------------------------------------------------------------
           * "Coming soon" glow (unchanged)
           * ------------------------------------------------------------ */
          @keyframes soonGlow {
            0%,100% { color: #bbb; text-shadow: 0 0 5px gold; }
            50%     { color: gold; text-shadow: 0 0 12px gold; }
          }

          /* --------------------------------------------------------------
           * Page transition — premium fade + slight upward slide
           * ------------------------------------------------------------ */
          .page-transition {
            animation: fadeSlideIn 520ms cubic-bezier(.16,.84,.44,1) both;
          }
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0);    }
          }

          /* --------------------------------------------------------------
           * Optional (visual aid): thin horizontal scrollbar styling
           * ------------------------------------------------------------ */
          ::-webkit-scrollbar {
            height: 6px;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 215, 0, 0.6);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
        `}
      </style>
    </div>
  );
}
