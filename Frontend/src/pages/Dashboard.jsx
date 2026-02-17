import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useParams, useNavigate } from 'react-router-dom'; 
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


/**
 * Dashboard Page
 * 
 * Displays the detected errors bar chart and other analytics.
 * This is the main page for analyzing test results.
 */
const Dashboard = () => {
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
        const [res1, res2] = await Promise.all([
          fetch('http://localhost:8000/api/results/detected_errors?limit=50'),
          fetch('http://localhost:8000/api/results/high_quality_errors?limit=50'),
        ]);

        if (!res1.ok) throw new Error(`Detected errors HTTP ${res1.status}`);
        if (!res2.ok) throw new Error(`High quality errors HTTP ${res2.status}`);

        const [json1, json2] = await Promise.all([res1.json(), res2.json()]);

        const d1 = Array.isArray(json1)
          ? json1.map((r) => ({
              x: r && typeof r.x !== 'undefined' ? r.x : null,
              detected_errors:
                r && r.detected_errors != null && !Number.isNaN(Number(r.detected_errors))
                  ? Number(r.detected_errors)
                  : 0,
            }))
          : [];

        const d2 = Array.isArray(json2)
          ? json2.map((r) => ({
              x: r && typeof r.x !== 'undefined' ? r.x : null,
              high_quality_errors:
                r && r.high_quality_errors != null && !Number.isNaN(Number(r.high_quality_errors))
                  ? Number(r.high_quality_errors)
                  : 0,
            }))
          : [];

        if (mounted) {
          setDetectedData(d1);
          setHighData(d2);
        }
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
  }, []);

  
  const sharedMaxYRaw = Math.max(
    0,
    ...detectedData.map((d) => d.detected_errors ?? 0),
    ...highData.map((d) => d.high_quality_errors ?? 0)
  );

  
  const sharedMaxY = Math.ceil(sharedMaxYRaw / 4) * 4 || 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Results Dashboard</h1>
        <p>Analyzing detected errors across all test results</p>
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
            <ChartArea data={detectedData} loading={loading} error={error} maxY={sharedMaxY} />
          
            <HighQualityErrorsBarChart data={highData} loading={loading} error={error} maxY={sharedMaxY} />
          </div>

          <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
            <ChartAreaCompareModels />
          </div>
<<<<<<< HEAD

          <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
            <Combined/>
          </div>

          <div className="chart-wrapper" style={{ width: '100%', height: 500 }}>
            <Stability/>
          </div>
=======
         
    <div className="chart-wrapper" style={{ width: '100%', height: 400 }}>
      <Accuracy />
    </div>
>>>>>>> master
        </div>
      </div>
    </div>
  );
};

// ChartArea component kept inside this file per requirement (no separate file)
function ChartArea({ data, loading, error, maxY }) {
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
        <XAxis dataKey="x" label={{ value: 'Result', position: 'insideBottomRight', offset: -10 }} />
        <YAxis domain={[0, maxY]} label={{ value: 'Detected Errors', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value}`} labelFormatter={(label) => `Result #${label}`} />
        <Bar dataKey="detected_errors" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HighQualityErrorsBarChart({ data, loading, error, maxY }) {
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
        <XAxis dataKey="x" label={{ value: 'Result', position: 'insideBottomRight', offset: -10 }} />
        <YAxis domain={[0, maxY]} label={{ value: 'High Quality Errors', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value}`} labelFormatter={(label) => `Result #${label}`} />
        <Bar dataKey="high_quality_errors" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ChartAreaCompareModels kept inside this file per requirement (no separate file)
function ChartAreaCompareModels() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // TODO: change project_id as needed
        const projectId = 2;
        const limit = 50;

        const res = await fetch(
          `http://localhost:8000/api/results/compare_ai_models?project_id=${projectId}&limit=${limit}`
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
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ width: '100%', textAlign: 'center', paddingTop: 40 }}>
        Loading chart data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', textAlign: 'center', color: 'red', paddingTop: 20 }}>
        Error loading data: {error}
      </div>
    );
  }

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
          formatter={(value, name, props) => {
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

<<<<<<< HEAD
function Combined() {
  return <CombinedGraph />;
}

function Stability() {
  return <StabilityGraph/>;
}
=======
function Accuracy(){
  
//  const { projectId } = useParams()
const projectId = 2;
    const [configurations, setConfigurations] = useState([])
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
   
    
    useEffect(() => {
            const fetchData = async () => {
                try{
                    const configResponse = await fetch (`${API_BASE_URL}/get_config_data?project_id=${projectId}`)
                    const configData = await configResponse.json()
                    setConfigurations(configData)
                    setLoading(false)

                } catch(err) {
                    console.error('Error fetching configurations:', err)
                    setError(err.message)
                    setLoading(false)
            }
            }

        fetchData()
    }, [projectId])

    return ( <Accuracy_graph configdata={configurations}/> );
 
}





>>>>>>> master

export default Dashboard;
