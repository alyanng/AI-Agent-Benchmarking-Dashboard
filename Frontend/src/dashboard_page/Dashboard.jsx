import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useParams, useNavigate } from "react-router-dom";
import Accuracy_graph from "./Accuracy_graph.jsx";
import ChartArea from "./ChartArea.jsx";
import HighQualityErrorsBarChart from "./HighQualityErrorsBarChart.jsx";
import Model_graph from "./Model_graph.jsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import CombinedGraph from "./combined";
import StabilityGraph from "./stability";
import MetricChart from "./MetricChart";
import NavBar from "../components/NavBar.jsx";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Dashboard Page
 *
 * Displays the detected errors bar chart and other analytics.
 * This is the main page for analyzing test results.
 */
const Dashboard = () => {
  const { projectId } = useParams();
  const [detectedData, setDetectedData] = useState([]);
  const [highData, setHighData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accuracydata, setAccuracydata] = useState([]);
  const [fixdata, setFixdata] = useState([]);
  const [modeldata, setModeldata] = useState([]);
  const [combinedata, setCombinedata] = useState([]);
  const [stabilitydata, setStabilitydata] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchBoth() {
      setLoading(true);
      setError(null);
      try {
        const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
          fetch(
            `http://localhost:8000/api/results/detected_errors?projectid=${projectId}`,
          ),
          fetch(
            `http://localhost:8000/api/results/high_quality_errors?projectid=${projectId}`,
          ),
          fetch(`${API_BASE_URL}/get_config_data?project_id=${projectId}`),
          fetch(`${API_BASE_URL}/get_performance_data?project_id=${projectId}`),
          fetch(`${API_BASE_URL}/get_config_data_new?project_id=${projectId}`),
          fetch(`${API_BASE_URL}/get_combined_data?project_id=${projectId}`),
          fetch(`${API_BASE_URL}/get_stability_data?project_id=${projectId}`),
        ]);

        const data = await r1.json();
        const data2 = await r2.json();
        const data3 = await r3.json();
        const data4 = await r4.json();
        const data5 = await r5.json();
        const data6 = await r6.json();
        const data7 = await r7.json();

        setDetectedData(data);
        setHighData(data2);
        setAccuracydata(data3);
        setFixdata(data4);
        setModeldata(data5);
        setCombinedata(data6);
        setStabilitydata(data7);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBoth();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  return (
    <>
      <NavBar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Results Dashboard</h1>
        </div>

        <div className="dashboard-content">
          <div className="chart-section">

{projectId === '1' && (
  <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
    <Model_graph data={modeldata} />
  </div>
)}

{projectId !== '1' && (<>

            <div
              className="chart-wrapper"
              style={{ width: "100%", height: 300 }}
            >
              <ChartArea data={detectedData} loading={loading} error={error} />

              <HighQualityErrorsBarChart
                data={highData}
                loading={loading}
                error={error}
              />
            </div>

            {/* <div
              className="chart-wrapper"
              style={{ width: "100%", height: 500 }}
            >
              <Model_graph data={modeldata} />
            </div> */}

             <div className="chart-wrapper" style={{ width: "100%", height: 500 }}> <Accuracy_graph data={accuracydata} /></div>

            <div
              className="chart-wrapper"
              style={{ width: "100%", height: 500 }}
            >
              <CombinedGraph data={combinedata} />
            </div>

            <div
              className="chart-wrapper"
              style={{ width: "100%", height: 500 }}
            >
              <StabilityGraph data={stabilitydata} />
            </div>

            <div
              className="chart-wrapper"
              style={{ width: "100%", height: 500 }}
            >
              <Fixes data={fixdata} />
            </div>

           
</>)}
</div>
        </div>
      </div>
    </>
  );
};

function Fixes({ data }) {
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ display: "flex", gap: "100px" ,alignItems:"flex-start" }}>
      <div style={{ flex: 1,minWidth: 500 }}>
        <h3 style={{ textAlign: 'center' }}>Average Fixed Errors per Prompt</h3>
        <MetricChart data={data} yKey="fixes" yLabel="Errors Fixed" />
      </div>
      <div style={{ flex: 1,minWidth: 500 }}>
        <h3 style={{ textAlign: 'center' }}>Average Duration per Prompt (Minutes)</h3>
        <MetricChart data={data} yKey="duration" yLabel="Duration" />
      </div>
      {/* items.map((item, index) => <Bar key={index} ... />) */}
    </div>
  );
}

export default Dashboard;
