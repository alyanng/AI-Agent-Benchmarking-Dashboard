import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import MetricChart from "./MetricChart";

export default function AgentPerformance() {
  // CHANGED: we now load by projectId
  const { projectId } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // CHANGED: fetch all prompts for the project
        const res = await fetch(
          `${API_BASE_URL}/get_performance_data?project_id=${projectId}`
        );

        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL, projectId]);

  if (loading) return <div>Loading performance data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (data.length === 0) return <div>No performance data found.</div>;

  return (
      <div style={{ padding: 16 }}>
        <h2>Agent Performance - Project {projectId}</h2>

        <h3>Average Fixed Errors per Prompt</h3>
        <MetricChart data={data} yKey="fixes" yLabel="Errors Fixed" />

        <h3>Average Duration per Prompt (Minutes)</h3>
        <MetricChart data={data} yKey="duration" yLabel="Duration" />
      </div>
  );
}
