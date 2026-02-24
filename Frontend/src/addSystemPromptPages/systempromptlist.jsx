import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../NavBar";
import ExpandableText from "../ExpandableText";

import '../configuration.css';
import '../Home.css';

function SystemPromptList() {
  const { projectId } = useParams();
  const [configurations, setConfigurations] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const configResponse = await fetch(`${API_BASE_URL}/get_config_data_forResults?project_id=${projectId}`);
        const configData = await configResponse.json();
        setConfigurations(configData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching system prompts:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <NavBar />

      <div style={{ padding: 16 }}>
       
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1>System prompts</h1>

         
          <button className= "error-button" style = {{width: "15%"}}
            onClick={() => navigate(`/addsystemprompt/${projectId}`)}
          >
            Add new system prompt
          </button>
        </div>

       
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>System Prompt</th>
            </tr>
          </thead>
          <tbody>
            {configurations.map(config => (
              <tr key={config.configid}>
                <td>{config.configid}</td>
                <td className="formatted-text">
                  <ExpandableText text={config.prompt} wordLimit={50} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SystemPromptList;
