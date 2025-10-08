import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Zayd from "../assets/mascots/mascot_zayd_default.webp";
import ZaydChallenge from "../assets/mascots/mascot_zayd_challenge.webp";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_shield from "../assets/ui/ui_shield.webp";

export default function Home() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [page, setPage] = useState(0); // 0..2

  const [xp] = useState(120);
  const [coins] = useState(45);
  const [streak] = useState(5);

  const unlocked = [
    { id: 1, title: "Names of Allah", progress: 0.35 },
    { id: 2, title: "Six Pillars of Islam", progress: 0.2 },
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

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const ratio = max > 0 ? el.scrollLeft / max : 0;
      // 3 fixed pages as requested
      if (ratio < 0.33) setPage(0);
      else if (ratio < 0.66) setPage(1);
      else setPage(2);
    };

    // fire once on mount to set initial page correctly
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
        padding: 16,
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: 8,
          columnGap: 8,
        }}
      >
        {/* Left icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[
            { icon: ui_streak, value: streak },
            { icon: ui_xp, value: xp },
          ].map(({ icon, value }, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={icon}
                alt="Icon"
                style={{
                  width: 40,
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
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

        {/* Mascot */}
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

        {/* Right icons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={ui_coin}
              alt="Coins"
              style={{
                width: 40,
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
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

          {/* SHIELD */}
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
                boxShadow: "0 0 14px rgba(255,215,0,0.6)",
                animation: "shieldGlow 2.5s ease-in-out infinite alternate",
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h1 className="title-shimmer">IslamQuest</h1>
      </div>

      {/* GREETING */}
      <p
        style={{
          textAlign: "center",
          fontSize: "1.05rem",
          margin: "6px 0 14px",
        }}
      >
        As-salāmu ʿalaykum, Explorer 👋
      </p>

      {/* DAILY QUEST */}
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
            onClick={() => navigate("/daily-challenge")}
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
            onMouseEnter={(e) => (e.target.style.background = "#ffdd33")}
            onMouseLeave={(e) => (e.target.style.background = "gold")}
          >
            Let’s Go!
          </button>
        </div>
        <img
          src={ZaydChallenge}
          alt="Zayd Challenge"
          style={{
            width: 80,
            height: "auto",
            marginLeft: 10,
            animation: "floatY 2.2s ease-in-out infinite",
          }}
        />
      </div>

      {/* LEARNING PATHS (with depth overlay) */}
      <div style={{ position: "relative", padding: "0 0 12px" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "100%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0))",
            pointerEvents: "none",
          }}
        />
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
                  ? navigate(`/learn/${p.id}`)
                  : alert(`${p.title} coming soon!`)
              }
              style={{
                minWidth: 160,
                height: 230,
                background: p.locked
                  ? "linear-gradient(145deg, #1a1a1a, #2a2a2a)"
                  : "linear-gradient(145deg, #006d9c, #00a0c8)", // slightly dimmer unlocked
                borderRadius: 18,
                position: "relative",
                boxShadow: p.locked
                  ? "0 0 10px rgba(150,150,150,0.4)"
                  : "0 0 18px rgba(0,255,255,0.25)",
                opacity: 1,
                flexShrink: 0,
                textAlign: "center",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
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

      {/* ✅ FIXED PAGINATION DOTS */}
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 8,
          marginBottom: 12,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            background: "rgba(0,0,0,0.3)",
            padding: "8px 14px",
            borderRadius: 20,
            boxShadow: "0 0 10px rgba(255,215,0,0.3)",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: i === page ? "gold" : "#555",
                boxShadow: i === page ? "0 0 10px gold" : "none",
                transform: i === page ? "scale(1.3)" : "scale(1)",
                transition: "all 0.35s ease",
              }}
            />
          ))}
        </div>
      </div>

      <style>
        {`
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
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          @keyframes shieldGlow {
            from { filter: drop-shadow(0 0 6px rgba(0,255,255,0.6)); }
            to   { filter: drop-shadow(0 0 14px rgba(0,255,255,1)); }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes dqPulse {
            0%,100% { box-shadow: 0 0 10px rgba(0,255,209,0.3); }
            50%     { box-shadow: 0 0 22px rgba(255,215,0,0.4); }
          }
          @keyframes pawPulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 8px gold);
            }
            50% {
              transform: scale(1.2);
              filter: drop-shadow(0 0 18px gold);
            }
          }
          @keyframes soonGlow {
            0%, 100% { color: #bbb; text-shadow: 0 0 5px gold; }
            50% { color: gold; text-shadow: 0 0 12px gold; }
          }
        `}
      </style>
    </div>
  );
}
