import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from '../NavBar';
import '../Home.css'

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setErrMsg("");

        const url = `${API_BASE_URL}/projects`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setProjects(data);
      } catch (e) {
        setErrMsg(e?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (errMsg) return (
    <div style={{ padding: 16, color: "red" }}>
      <h3>Error Loading Projects</h3>
      <p><strong>{errMsg}</strong></p>
    </div>
  );

  if (projects.length === 0) return (
    <div style={{ padding: 16 }}>
      <NavBar />
      <h2>My Tested Projects</h2>
      <p style={{ color: "#666" }}>No projects found.</p>
    </div>
  );

  return (
    <>
      <NavBar />
      <div style={{ padding: 16 }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "50%", margin: "0 auto"}}>
          <thead>
            <tr>
              <th>Project Name</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, index) => (
              <tr key={p.project_id}>
                <td>{p.project_name}</td>
                <td>
                    <div style={{textAlign: "center"}}>
                    <button className="config-button" onClick={() => navigate(`/systempromptlist/${p.project_id}`)}>
                    System prompts
                    </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
