import { NavLink } from "react-router-dom";
import { Home, BookOpen, Trophy, Users, User } from "lucide-react";

export default function BottomNav() {
  const navItems = [
    { path: "/", icon: <Home size={22} />, label: "Home" },
    { path: "/learn", icon: <BookOpen size={22} />, label: "Learn" },
    { path: "/challenge", icon: <Trophy size={22} />, label: "Challenge" },
    { path: "/friends", icon: <Users size={22} />, label: "Friends" },
    { path: "/profile", icon: <User size={22} />, label: "Profile" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#1e293b",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
        borderTop: "2px solid #334155",
        zIndex: 1000,
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            color: isActive ? "#facc15" : "#94a3b8",
            textAlign: "center",
            textDecoration: "none",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          })}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
