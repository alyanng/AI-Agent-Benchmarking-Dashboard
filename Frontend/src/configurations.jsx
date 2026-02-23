import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "./NavBar";
import ExpandableText from "./ExpandableText";

import './configuration.css';
import './Home.css';

function Configurations() {
  const { projectId } = useParams();
  const [configurations, setConfigurations] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configResponse = await fetch(`${API_BASE_URL}/get_config_data?project_id=${projectId}`);
        const configData = await configResponse.json();
        setConfigurations(configData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching configurations:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, [API_BASE_URL, projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <NavBar />

      <div style={{ padding: 16 }}>
        {/* Page Header + Agent Performance Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1>System prompts</h1>

          {/* CHANGED: simplified - button goes directly to project-level performance */}
          <button
            className="error-button" style = {{width: "15%"}}
            onClick={() => navigate(`/dashboard/${projectId}`)}
          >
            View Agent Performance
          </button>
        </div>

        {/* Configurations Table */}
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>System Prompt</th>
              <th>Number of Fixes</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {configurations.map(config => (
              <tr key={config.configid}>
                <td>{config.configid}</td>
                <td className="formatted-text">
                  <ExpandableText text={config.prompt} wordLimit={50} />
                </td>
                <td>{config.fixes}</td>
                <td>{config.duration}</td>
                <td>
                  <button
                    className="error-button"
                    onClick={() => navigate(`/errors/${config.configid}`)}
                  >
                    Errors
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

export default Configurations;
