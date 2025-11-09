import { useParams } from "react-router-dom";

export default function PathPage() {
  const { id } = useParams();
  return (
    <div className="screen" style={{ textAlign: "center", padding: "clamp(16px, 4vw, 40px)", color: "white" }}>
      <h2>📘 Learning Path {id}</h2>
      <p>Content coming soon, in shāʾ Allāh.</p>
    </div>
  );
}
