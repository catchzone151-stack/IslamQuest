import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, BookOpen, Sword, Users, User } from "lucide-react";

export default function BottomNav() {
  const { pathname } = useLocation();

  const Item = ({ to, label, icon: Icon }) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        to={to}
        aria-label={label}
        className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition
          ${active ? "bg-white/90 shadow-sm" : "bg-white/60"}
        `}
        style={{
          minWidth: 72,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Icon size={22} aria-hidden="true" />
        <span style={{ fontSize: 12, lineHeight: "14px" }}>{label}</span>
      </Link>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        padding: "10px 12px calc(env(safe-area-inset-bottom) + 10px)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 520,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          background: "rgba(255,255,255,0.55)",
          borderRadius: 20,
          padding: 8,
          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Item to="/" label="Home" icon={HomeIcon} />
        <Item to="/revise" label="Revise" icon={BookOpen} />
        <Item to="/challenge" label="Challenge" icon={Sword} />
        <Item to="/friends" label="Friends" icon={Users} />
        <Item to="/profile" label="Profile" icon={User} />
      </div>
    </nav>
  );
}
