import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Sword, Users, User } from "lucide-react";
import { useFriendsStore } from "../store/friendsStore";

const NAV_HEIGHT = 76;

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { incomingRequests, hasUnseenRequests } = useFriendsStore();

  const tabs = [
    { path: "/", label: "Home", icon: <Home size={22} /> },
    { path: "/revise", label: "Revise", icon: <BookOpen size={22} /> },
    { path: "/challenge", label: "Challenge", icon: <Sword size={22} /> },
    { path: "/friends", label: "Friends", icon: <Users size={22} />, badge: hasUnseenRequests ? incomingRequests.length : 0 },
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
        background: "#0e2340",
        borderTop: "1px solid #0e2340",
        boxShadow: "none",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1000,
        paddingBottom: "env(safe-area-inset-bottom)",
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
              position: "relative",
            }}
          >
            {tab.icon}
            <span style={{ fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
            {tab.badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: "calc(50% - 20px)",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "bold",
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
