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
import { useNavigate } from "../hooks/useNavigate";
import { Footprints, Lock } from "lucide-react";

import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { useDailyQuestStore } from "../store/dailyQuestStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { isPremiumOnlyPath } from "../store/premiumConfig";

// Components
import DailyQuestCard from "../components/dailyquest/DailyQuestCard";

// Mascots & UI assets
import Zayd from "../assets/mascots/mascot_waving.webp";
import ZaydChallenge from "../assets/mascots/mascot_boss.webp";
import MainMascot from "../assets/mascots/mascot_sitting.webp";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_shield from "../assets/ui/ui_shield.webp";

export default function Home() {
  // Navigation
  const navigate = useNavigate();
  const { name } = useUserStore();
  const { premium, premiumStatus } = useProgressStore();
  const isUserPremium = premium || premiumStatus !== "free";

  // Horizontal scroll ref for the learning path cards
  const carouselRef = useRef(null);

  // Which "page" of the carousel we're on (0 / 1 / 2)
  const [page, setPage] = useState(0);

  // 🎉 Easter Egg: Mascot tap counter
  const [mascotTaps, setMascotTaps] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const tapTimeoutRef = useRef(null);
  const sparkleTimeoutRef = useRef(null);

  // Ramadan countdown state (3-segment: months/weeks/days)
  const [ramadanStats, setRamadanStats] = useState({
    months: "--",
    weeks: "--",
    days: "--",
  });

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
    ensureLocksReady,
    addXP,
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

  // Ramadan countdown timer (updates every minute to GMT)
  useEffect(() => {
    function calculateDiff() {
      // Target: 18 February 2026 00:00 GMT
      const target = new Date(Date.UTC(2026, 1, 18, 0, 0, 0));
      const now = new Date();

      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setRamadanStats({ months: "00", weeks: "00", days: "00" });
        return;
      }

      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

      const months = Math.floor(totalDays / 30.44);
      const remainingAfterMonths = totalDays % 30.44;

      const weeks = Math.floor(remainingAfterMonths / 7);
      const days = Math.floor(remainingAfterMonths % 7);

      setRamadanStats({
        months: months.toString().padStart(2, "0"),
        weeks: weeks.toString().padStart(2, "0"),
        days: days.toString().padStart(2, "0"),
      });
    }

    calculateDiff();
    const interval = setInterval(calculateDiff, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

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
   * Used by the page dots
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
   * - Ensure locks are ready (prevent race conditions)
   * - Check if path is premium-locked
   * - If locked, show premium paywall modal
   * - Otherwise navigate to /pathway/:id
   */
  const handlePathClick = (p) => {
    // Ensure locks are initialized before checking
    ensureLocksReady();
    
    // Check if path is premium-locked
    const isPremiumPath = isPremiumOnlyPath(p.id);
    if (isPremiumPath && !isUserPremium) {
      // Show premium paywall modal instead of navigating
      showModal(MODAL_TYPES.PURCHASE);
      return;
    }
    
    navigate(`/path/${p.id}`);
  };

  /**
   * 🎉 Easter Egg: Handle mascot tap
   * - Count taps within 3.5 second window
   * - Award +1 XP on 5th tap
   * - Show sparkle animation on XP counter
   */
  const handleMascotTap = () => {
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Increment tap count
    const newTapCount = mascotTaps + 1;
    setMascotTaps(newTapCount);

    // Check if we've hit 5 taps
    if (newTapCount === 5) {
      // Award +1 XP using the same method as normal XP
      addXP(1);
      
      // Clear any existing sparkle timeout
      if (sparkleTimeoutRef.current) {
        clearTimeout(sparkleTimeoutRef.current);
      }
      
      // Show sparkle animation
      setShowSparkle(true);
      sparkleTimeoutRef.current = setTimeout(() => setShowSparkle(false), 500);
      
      // Reset tap counter
      setMascotTaps(0);
    } else {
      // Set timeout to reset counter after 3.5 seconds of inactivity
      tapTimeoutRef.current = setTimeout(() => {
        setMascotTaps(0);
      }, 3500);
    }
  };

  /**
   * 🎉 Easter Egg: Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (sparkleTimeoutRef.current) {
        clearTimeout(sparkleTimeoutRef.current);
      }
    };
  }, []);

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
      className="screen no-extra-space page-transition"
      style={{
        background: "#0e2340",
        color: "white",
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
          marginBottom: 18,
          columnGap: 8,
          padding: "16px 16px 0 16px",
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
                position: "relative",
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
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#ffd85a",
                  position: "relative",
                }}
              >
                {typeof value === "number" ? value.toLocaleString() : value}
                {/* 🎉 Easter Egg: Sparkle animation on XP counter */}
                {i === 1 && showSparkle && (
                  <>
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "1.5rem",
                        animation: "sparkle 0.5s ease-out",
                        pointerEvents: "none",
                      }}
                    >
                      ✨
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        fontSize: "1rem",
                        animation: "sparkle 0.5s ease-out 0.1s",
                        pointerEvents: "none",
                      }}
                    >
                      ✨
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        bottom: "-10px",
                        left: "-10px",
                        fontSize: "1rem",
                        animation: "sparkle 0.5s ease-out 0.2s",
                        pointerEvents: "none",
                      }}
                    >
                      ✨
                    </span>
                  </>
                )}
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
            onClick={handleMascotTap}
            style={{
              width: 100,
              height: 100,
              display: "block",
              margin: "0 auto",
              willChange: "transform",
              transform: "translateZ(0)",
              cursor: "pointer",
              userSelect: "none",
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
      <div style={{ textAlign: "center", marginBottom: 14, padding: "0 16px" }}>
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
          margin: "6px 16px 20px 16px",
          fontWeight: "800",
          color: "#FFD700",
          textShadow: "0 2px 8px rgba(212, 175, 55, 0.4)",
          letterSpacing: "0.5px",
        }}
      >
        Assalamu Alaikum, {name || "Explorer"} 👋
      </p>

      {/*
       * ===============================================================
       * DAILY QUEST CARD
       * ===============================================================
       */}
      <div style={{ padding: "0 16px" }}>
        <DailyQuestCard />
      </div>

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
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 8,
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="hide-scrollbar"
        >
          {paths.map((p, index) => {
            const gradient =
              gradients[index] || gradients[index % gradients.length];
            const progress = typeof p.progress === "number" ? p.progress : 0;
            const percent = Math.min(100, Math.max(0, progress * 100));
            const completed = p.completedLessons || 0;
            const total = p.totalLessons || 0;
            const isFull = total > 0 && completed >= total;
            
            // Check if path is premium-locked
            const isPremiumPath = isPremiumOnlyPath(p.id);
            const isLocked = isPremiumPath && !isUserPremium;

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
                {/* Grey lock overlay for premium-only paths */}
                {isLocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(30, 30, 30, 0.85)",
                      borderRadius: 18,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      gap: 8,
                    }}
                  >
                    <Lock 
                      size={32} 
                      color="#D4AF37" 
                      strokeWidth={2.5}
                      style={{ filter: "drop-shadow(0 0 4px rgba(212,175,55,0.5))" }}
                    />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#D4AF37",
                        fontWeight: 700,
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      Premium Only
                    </span>
                  </div>
                )}
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

                {/* Footprints badge, pulsing */}
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
                  <Footprints 
                    size={20} 
                    strokeWidth={2.5}
                    color="#FFD700"
                    style={{ filter: "drop-shadow(0 0 3px rgba(255,215,0,0.4))" }}
                  />
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
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === page ? "gold" : "#555",
              boxShadow: i === page ? "0 0 10px gold" : "none",
              transform: i === page ? "scale(1.2)" : "scale(1)",
              transition: "all 0.25s ease",
              margin: "0 6px",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/*
       * ===============================================================
       * RAMADAN COUNTDOWN WIDGET (3-Segment Pill) / GLOBAL EVENTS
       * ===============================================================
       */}
      <div
        onClick={() => {
          // Check if user has premium access before navigating to Global Events
          if (!isUserPremium) {
            showModal(MODAL_TYPES.PURCHASE);
            return;
          }
          showModal(MODAL_TYPES.RAMADAN_COMING_SOON);
        }}
        style={{
          width: "100%",
          marginTop: 32,
          marginBottom: 12,
          background: "#0a2a43",
          borderRadius: 22,
          padding: "14px 16px",
          border: "1.5px solid rgba(255,215,0,0.35)",
          boxShadow: "0 0 12px rgba(255,215,0,0.18)",
          cursor: "pointer",
          animation: "floatY 3.5s ease-in-out infinite",
          position: "relative",
        }}
      >
        {/* Title */}
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#FFD700",
            marginBottom: 10,
            letterSpacing: "0.3px",
          }}
        >
          🌙 Ramadan Countdown
        </div>

        {/* Segmented Pill Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {[
            { value: ramadanStats.months, label: "Months" },
            { value: ramadanStats.weeks, label: "Weeks" },
            { value: ramadanStats.days, label: "Days" },
          ].map((seg, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,215,0,0.08)",
                borderRadius: 16,
                padding: "10px 0",
                border: "1px solid rgba(255,215,0,0.25)",
                boxShadow: "0 0 8px rgba(255,215,0,0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#FFD700",
                }}
              >
                {seg.value}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#d4d4d4",
                }}
              >
                {seg.label}
              </div>
            </div>
          ))}
        </div>
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

        @keyframes floatY {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
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

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
