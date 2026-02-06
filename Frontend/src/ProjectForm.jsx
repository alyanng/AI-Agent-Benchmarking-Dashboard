import { useState } from "react";
import { postProject } from "./api/projects";

function ProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await postProject({
        project_name: projectName,
        github_url: githubUrl,
        number_of_errors: Number(errors),
      });

      if (response.project_id) {
        setMessage(`Project added! ID: ${response.project_id}`);
      } else {
        setMessage(`Error: ${response.detail || "Unknown error"}`);
      }

      setProjectName("");
      setGithubUrl("");
      setErrors("");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div>
      <h2>Submit a Project</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Project Name:</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>GitHub URL:</label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Number of Errors:</label>
          <input
            type="number"
            value={errors}
            onChange={(e) => setErrors(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Project</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ProjectForm;
