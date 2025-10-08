import { useParams } from "react-router-dom";

export default function PathPage() {
  const { id } = useParams();
  return (
    <div className="screen" style={{ textAlign: "center", padding: 40, color: "white" }}>
      <h2>📘 Learning Path {id}</h2>
      <p>Content coming soon, in shāʾ Allāh.</p>
    </div>
  );
}
