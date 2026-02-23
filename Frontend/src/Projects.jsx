import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from './NavBar';
import './Home.css'

export default function Projects() {
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
  }, [API_BASE_URL]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (errMsg) return (
    <div style={{ padding: 16, color: "red" }}>
      <h3>⚠️ Error Loading Projects</h3>
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
        <h2>My Tested Projects</h2>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Project Name</th>
              <th>GitHub URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, index) => (
              <tr key={p.project_id}>
                <td>{index + 1}</td>
                <td>{p.project_name}</td>
                <td>
                  <a href={p.github_url} target="_blank" rel="noopener noreferrer">
                    {p.github_url}
                  </a>
                </td>
                <td>
                  <button className="config-button" onClick={() => navigate(`/configurations/${p.project_id}`)}>
                    More Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
