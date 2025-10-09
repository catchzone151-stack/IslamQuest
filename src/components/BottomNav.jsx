/**
 * IslamQuest — Bottom Navigation (Premium Global)
 * ---------------------------------------------------------------------------
 *  ✅ Fixed globally at the bottom on every page.
 *  ✅ Dynamic safe-area padding (no more blank gap above).
 *  ✅ Polished glassy gradient + blur.
 *  ✅ Fade-slide-in animation for premium entry feel.
 *  ✅ Accessibility labels + active tab glow.
 *  ✅ Future-proof for hiding via showNav prop if needed later.
 * ---------------------------------------------------------------------------
 */

import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, BookOpen, Sword, Users, User } from "lucide-react";

export default function BottomNav() {
  const { pathname } = useLocation();

  const tabs = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/revise", label: "Revise", icon: BookOpen },
    { to: "/challenge", label: "Challenge", icon: Sword },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="bottom-nav-fade"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background:
          "linear-gradient(180deg, rgba(10,25,47,0.75), rgba(10,25,47,0.9))",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "6px 12px calc(env(safe-area-inset-bottom) + 6px)", // 🔹 tightened padding
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
          borderRadius: 18,
          padding: 8,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        }}
      >
        {tabs.map(({ to, label, icon: Icon }) => {
          const active =
            pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "8px 6px",
                borderRadius: 12,
                color: active ? "#FFC300" : "rgba(255,255,255,0.85)",
                boxShadow: active ? "0 0 12px rgba(255,195,0,0.45)" : "none",
                background: active
                  ? "linear-gradient(180deg, rgba(255,195,0,0.12), rgba(255,195,0,0.05))"
                  : "transparent",
                transition: "all .25s ease",
              }}
            >
              <Icon size={22} />
              <span style={{ fontSize: 12 }}>{label}</span>
            </Link>
          );
        })}
      </div>

      <style>
        {`
          /* --------------------------------------------------------------
           * Bottom Nav Fade-Slide Animation
           * ------------------------------------------------------------ */
          .bottom-nav-fade {
            animation: fadeSlideInNav 0.6s cubic-bezier(.16,.84,.44,1) both;
          }

          @keyframes fadeSlideInNav {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* --------------------------------------------------------------
           * Optional: subtle highlight glow when hovering (desktop dev only)
           * ------------------------------------------------------------ */
          .bottom-nav-fade a:hover {
            filter: drop-shadow(0 0 4px rgba(255,215,0,0.4));
          }
        `}
      </style>
    </nav>
  );
}
