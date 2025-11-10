import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Sword, Users, User } from "lucide-react";

const NAV_HEIGHT = 76; // keep in sync with CSS padding

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { path: "/", label: "Home", icon: <Home size={22} /> },
    { path: "/revise", label: "Revise", icon: <BookOpen size={22} /> },
    { path: "/challenge", label: "Challenge", icon: <Sword size={22} /> },
    { path: "/friends", label: "Friends", icon: <Users size={22} /> },
    { path: "/profile", label: "Profile", icon: <User size={22} /> },
  ];

  return (
    <nav
      className="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: `${NAV_HEIGHT}px`,
        background: "linear-gradient(to bottom, #0e2340, #081426)",
        borderTop: "1px solid rgba(255, 215, 0, 0.1)",
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: "transparent",
              border: "none",
              color: active ? "var(--gold)" : "rgba(243,244,246,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "12px",
              cursor: "pointer",
              gap: "4px",
              transform: active ? "scale(1.08)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            {tab.icon}
            <span style={{ fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
