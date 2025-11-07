/**
 * IslamQuest — Home Screen (Premium Polished Build, Phase 1 Final Integration)
 * ---------------------------------------------------------------------------
 * This file preserves your full visual design, styling, layout, glow,
 * animations, header, mascot, Daily Quest card, carousel, dev slider,
 * etc. Nothing in the look/feel is removed.
 *
 * Updates in this version:
 *
 * 1) Paths now come from progressStore.js (dynamic), not hardcoded arrays.
 *    - paths[i].status === "available"  -> clickable, shows progress bar
 *    - paths[i].status === "coming_soon" -> non-clickable, shows "Coming soon, in shā’ Allāh"
 *
 * 2) English path titles are used (from the updated store you just installed).
 *    We still preserve "Prophet Muhammad ﷺ" with ﷺ.
 *
 * 3) XP / Coins / Streak are now display-only. No tap-to-increase.
 *    You asked for them to stay static (no dev cheating on click).
 *
 * 4) Daily Quest button now uses updateStreak() from the store instead of incrementStreak().
 *
 * 5) Bottom spacing fix is kept.
 *
 * IMPORTANT:
 * - You must have the updated progressStore.js (English titles version).
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";

// Mascots & UI assets
import Zayd from "../assets/mascots/mascot_zayd_default.webp";
import ZaydChallenge from "../assets/mascots/mascot_zayd_challenge.webp";
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

  // Pull live data from the store
  const {
    xp,
    coins,
    streak,
    updateStreak,
    paths, // dynamic list of 12 paths from progressStore.js
  } = useProgressStore();

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

    // Initialize + listen
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
   * - If available, navigate to lesson route
   * - If coming soon, show alert
   *
   * NOTE:
   * You already had special-case routing for "Six Pillars of Belief"
   * going to /path/aqeedah-pillars. We keep that logic.
   */
  const handlePathClick = (p) => {
    if (p.status === "available") {
      // match your previous special routing
      if (p.title === "Six Pillars of Belief") {
        navigate("/path/aqeedah-pillars");
      } else {
        navigate(`/pathway/${p.id}`);
      }
    } else {
      alert(`${p.title} — Coming soon, in shā’ Allāh!`);
    }
  };

  return (
    <div
      className="page-transition"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
        padding: 16,

        // bottom safe space above nav
        paddingBottom: "calc(env(safe-area-inset-bottom) + 30px)",

        overflowX: "hidden",
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
        {/* Left cluster: Streak + XP (CLEAN, numbers below) */}
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
                alt="Stat Icon"
                style={{
                  width: 40,
                }}
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
            src={Zayd}
            alt="Zayd Mascot"
            style={{
              width: 85,
              height: "auto",
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

          {/* Coins (CLEAN DISPLAY) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={ui_coin}
              alt="Coins"
              style={{
                width: 40,
              }}
            />
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

          {/* Shield teaser / shop teaser */}
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
            <span
              style={{
                marginTop: 4,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#4fd5ff",
                textShadow: "0 2px 4px rgba(0,0,0,0.55)",
              }}
            >
              0
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
          fontSize: "1.05rem",
          margin: "6px 0 14px",
        }}
      >
        As-salāmu ʿalaykum, {name || "Explorer"} 👋

      </p>

      {/*
       * ===============================================================
       * DAILY QUEST CARD
       * (includes ZaydChallenge bounce)
       * We changed incrementStreak() -> updateStreak() from the store.
       * ===============================================================
       */}
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
        }}
      >
        <div>
          <h3 style={{ color: "gold", margin: "0 0 6px" }}>Daily Quest</h3>
          <p style={{ margin: 0, color: "#e6f7ff" }}>
            Earn XP with today’s mini challenge!
          </p>

          <button
            onClick={() => {
              // update streak using the store
              updateStreak();
              // go to the challenge screen you already have
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

        {/* mascot variant with bounce */}
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
          }}
        />
      </div>

      {/*
       * ===============================================================
       * LEARNING PATHS CAROUSEL
       * This now uses `paths` from the store instead of hardcoded arrays.
       *
       * paths[i] format (from the store you installed):
       * {
       *    id: number,
       *    title: "Names of Allah" | ...,
       *    progress: 0.35,
       *    status: "available" | "coming_soon"
       * }
       *
       * - available     -> blue gradient card, clickable, shows progress bar
       * - coming_soon   -> dark card, not clickable, shows "Coming soon, in shā’ Allāh"
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
          {paths.map((p) => (
            <div
              key={p.id}
              onClick={() => handlePathClick(p)}
              style={{
                minWidth: 160,
                height: 230,
                background:
                  p.status === "available"
                    ? "linear-gradient(145deg, #006d9c, #00a0c8)"
                    : "linear-gradient(145deg, #1a1a1a, #2a2a2a)",
                borderRadius: 18,
                position: "relative",
                color: "#fff",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: p.status === "available" ? "pointer" : "default",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                if (p.status === "available") {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
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

              {/* If unlocked/available, show progress bar. Else show coming soon text. */}
              {p.status === "available" ? (
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
                    textAlign: "center",
                    padding: "0 8px",
                    lineHeight: 1.3,
                  }}
                >
                  Coming soon, in shā’ Allāh
                </p>
              )}

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
          ))}
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
       * You said to keep this "visible for QA during development".
       * We keep it exactly.
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
       * All exactly preserved from your premium polished build.
       * ===============================================================
       */}
      <style>{`
        .title-shimmer {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
          color: gold;
        }

        @keyframes bounceYSmooth {
          0% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-12px) scale(1.02); }
          50% { transform: translateY(-6px) scale(1.01); }
          75% { transform: translateY(-2px) scale(1.005); }
          100% { transform: translateY(0) scale(1); }
        }

        .page-transition {
          animation: fadeSlideIn 520ms cubic-bezier(.16,.84,.44,1) both;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.6); border-radius: 3px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        /* FORCE SHARP TEXT ON MOBILE */
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
