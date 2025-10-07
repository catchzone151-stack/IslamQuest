import assets from "../assets/assets";

export default function Home() {
  return (
    <div className="screen">
      <h1>IslamQuest</h1>
      <p>Welcome back! Continue your learning journey.</p>

      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <img
          src={assets.mascots.mascot_zayd_default}
          alt="Zayd the mascot"
          style={{ width: 120, height: "auto", borderRadius: "16px" }}
        />
        <p style={{ marginTop: 8, fontWeight: "bold", color: "var(--gold)" }}>
          Bismillah! Keep going ✨
        </p>
      </div>
    </div>
  );
}
