import React from "react";

const ProfileCard = React.memo(function ProfileCard({ icon, label, value, color = "#FFD700" }) {
  return (
    <div
      style={{
        textAlign: "center",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "16px",
        padding: "12px",
        border: "1px solid rgba(255,215,0,0.2)",
        color: "white",
        width: "120px",
        height: "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon && (
        <img
          src={icon}
          alt={label}
          style={{ width: "32px", height: "32px", marginBottom: "8px" }}
        />
      )}
      <p style={{ fontSize: "0.8rem", opacity: 0.7, margin: "4px 0" }}>{label}</p>
      <p style={{ color, fontWeight: "bold", fontSize: "1.1rem", margin: "4px 0" }}>{value}</p>
    </div>
  );
});

export default ProfileCard;
