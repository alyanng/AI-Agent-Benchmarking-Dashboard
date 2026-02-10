import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from './NavBar';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`);
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
  if (errMsg) return <div style={{ padding: 16, color: "red" }}>Error: {errMsg}</div>;

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
                <button onClick={() => navigate(`/configurations/${p.project_id}`)}>More Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
