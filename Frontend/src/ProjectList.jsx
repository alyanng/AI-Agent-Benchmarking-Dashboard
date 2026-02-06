import { useEffect, useState } from "react";
import { fetchProjects } from "./api/projects";

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects()
      .then((data) => setProjects(data.projects))
      .catch((err) => setError(err.message));
  }, []);

  // Function to handle Details button click
  const handleDetails = (project) => {
    alert(
      `Project Details:\n\nID: ${project.project_id}\nName: ${project.project_name}\nGitHub: ${project.github_url}\nErrors: ${project.number_of_errors}`
    );
  };

  return (
    <div>
      <h2>All Projects</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>Project Name</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>GitHub URL</th>
              <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project_id}>
                <td style={{ border: "1px solid black", padding: "8px" }}>{p.project_id}</td>
                <td style={{ border: "1px solid black", padding: "8px" }}>{p.project_name}</td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  <a href={p.github_url} target="_blank" rel="noopener noreferrer">
                    {p.github_url}
                  </a>
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  <button onClick={() => handleDetails(p)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProjectList;
