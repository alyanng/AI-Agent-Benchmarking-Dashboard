const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Submit a project
export async function postProject(project) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("Failed to submit project");
  return res.json();
}

// Fetch all projects
export async function fetchProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
