import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useParams } from 'react-router-dom'; 
import Accuracy_graph from "../Accuracy_graph";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import CombinedGraph from "../combined";
import StabilityGraph from "../stability";
import MetricChart from "../MetricChart";
import NavBar from "../NavBar";


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

  useEffect(() => {
    let mounted = true;

    async function fetchBoth() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/results/detected_errors?projectid=${projectId}`)
        const response2 = await fetch(`http://localhost:8000/api/results/high_quality_errors?projectid=${projectId}`)

        const data = await response.json()
        const data2 = await response2.json()

          setDetectedData(data);
          setHighData(data2);

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
        <p>Analyzing detected errors across all test results</p>
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
            <ChartArea data={detectedData} loading={loading} error={error}/>
          
            <HighQualityErrorsBarChart data={highData} loading={loading} error={error}/>
          </div>

          <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
            <ChartAreaCompareModels />
          </div>

          <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
            <Combined/>
          </div>

          <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
            <Stability/>
          </div>

          <div className="chart-wrapper" style={{ width: '100%', height: 900 }}>
            <Fixes/>
          </div>
         
    <div className="chart-wrapper" style={{ width: '100%', height: 400 }}>
      <Accuracy />
    </div>
        </div>
      </div>
    </div>
    </>
  );
};

// ChartArea component kept inside this file per requirement (no separate file)
function ChartArea({ data, loading, error}) {
  if (loading) {
    return <div style={{ width: '100%', textAlign: 'center', paddingTop: 40 }}>Loading chart data...</div>;
  }
  if (error) {
    return <div style={{ width: '100%', textAlign: 'center', color: 'red', paddingTop: 20 }}>Error loading data: {error}</div>;
  }
  if (!data || data.length === 0) {
    return <div style={{ width: '100%', textAlign: 'center', paddingTop: 40 }}>No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="configid" label={{ value: 'System prompt', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'Detected Errors', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value.toFixed(2)}}`} labelFormatter={(label) => `System prompt #${label}`} />
        <Bar dataKey="error" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HighQualityErrorsBarChart({ data, loading, error}) {
  if (loading) {
    return <div style={{ width: '100%', textAlign: 'center', paddingTop: 40 }}>Loading chart data...</div>;
  }
  if (error) {
    return <div style={{ width: '100%', textAlign: 'center', color: 'red', paddingTop: 20 }}>Error loading data: {error}</div>;
  }
  if (!data || data.length === 0) {
    return <div style={{ width: '100%', textAlign: 'center', paddingTop: 40 }}>No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="configid" label={{ value: 'System prompt', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'High Quality Errors', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value.toFixed(2)}}`} labelFormatter={(label) => `System #${label}`} />
        <Bar dataKey="high-quality" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ChartAreaCompareModels kept inside this file per requirement (no separate file)
function ChartAreaCompareModels() {
  const { projectId } = useParams(); 
  const [data, setData] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const limit = 50;

        const res = await fetch(
          `${API_BASE_URL}/api/results/compare_ai_models?project_id=${projectId}&limit=${limit}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // 1) sanitize raw rows
        const rows = Array.isArray(json)
          ? json.map((r) => ({
              model: r && r.model ? String(r.model) : 'Unknown',
              number_of_fixes:
                r && r.number_of_fixes != null && !Number.isNaN(Number(r.number_of_fixes))
                  ? Number(r.number_of_fixes)
                  : 0,
              duration:
                r && r.duration != null && !Number.isNaN(Number(r.duration)) ? Number(r.duration) : 0,
              tokens:
                r && r.tokens != null && !Number.isNaN(Number(r.tokens)) ? Number(r.tokens) : 0,
            }))
          : [];

        // 2) aggregate by model
        const byModel = new Map();
        for (const row of rows) {
          const key = row.model;

          if (!byModel.has(key)) {
            byModel.set(key, {
              model: key,
              total_fixes: 0,
              total_duration: 0,
              total_tokens: 0,
            });
          }

          const agg = byModel.get(key);
          agg.total_fixes += row.number_of_fixes;
          agg.total_duration += row.duration;
          agg.total_tokens += row.tokens;
        }

        // 3) build chart data (speed = fixes per minute)
        const aggregated = Array.from(byModel.values()).map((m) => ({
          model: m.model,
          total_fixes: m.total_fixes,
          speed: m.total_duration > 0 ? Number((m.total_fixes / m.total_duration).toFixed(3)) : 0,
          total_tokens: m.total_tokens,
          total_duration: Number(m.total_duration.toFixed(2)), // optional for tooltip
        }));

        if (mounted) setData(aggregated);
      } catch (err) {
        console.error('Error fetching compare models:', err);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [API_BASE_URL, projectId]);

  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', textAlign: 'center', paddingTop: 40 }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="model"
          interval={0}
          angle={-15}
          textAnchor="end"
          height={60}
          label={{ value: 'AI Model', position: 'insideBottomRight', offset: -10 }}
        />

        <YAxis
          yAxisId="left"
          label={{ value: 'Fixes / Speed', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'Tokens', angle: -90, position: 'insideRight' }}
        />

        <Tooltip
          formatter={(value, name) => {
            if (name === 'total_fixes') return [`${value}`, 'Total Fixes'];
            if (name === 'speed') return [`${value}`, 'Speed (fixes/min)'];
            if (name === 'total_tokens') return [`${value}`, 'Total Tokens'];
            return [`${value}`, name];
          }}
          labelFormatter={(label) => `Model: ${label}`}
        />

        {/* requires: import { Legend } from 'recharts' */}
        <Legend />

        {/* side-by-side bars */}
        <Bar yAxisId="left" dataKey="total_fixes" name="Total Fixes" fill="#3b82f6" />
        <Bar yAxisId="left" dataKey="speed" name="Speed (fixes/min)" fill="#22c55e" />
        <Bar yAxisId="right" dataKey="total_tokens" name="Total Tokens" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Combined() {
  const { projectId } = useParams()
  return <CombinedGraph projectId = {projectId}/>;
}

function Stability() {
  const { projectId } = useParams()
  return <StabilityGraph projectId = {projectId}/>;
}

function Accuracy(){
  
const { projectId } = useParams()
    const [configurations, setConfigurations] = useState([])

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
   
    
    useEffect(() => {
            const fetchData = async () => {
                try{
                    const configResponse = await fetch (`${API_BASE_URL}/get_config_data?project_id=${projectId}`)
                    const configData = await configResponse.json()
                    setConfigurations(configData)

                } catch(err) {
                    console.error('Error fetching configurations:', err)
            }
            }

        fetchData()
    }, [API_BASE_URL, projectId])

    return ( <Accuracy_graph configdata={configurations}/> );
 
}

function Fixes() {
   const { projectId } = useParams();

  const [data, setData] = useState([]);

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
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
      }
    };

    fetchData();
  }, [API_BASE_URL, projectId]);
  
  return (
    <div>
      <h3>Average Fixed Errors per Prompt</h3>
      <MetricChart data={data} yKey="fixes" yLabel="Errors Fixed" />
    
      <h3>Average Duration per Prompt (Minutes)</h3>
      <MetricChart data={data} yKey="duration" yLabel="Duration" />

    </div>
  )
}







export default Dashboard;
