import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';


/**
 * Dashboard Page
 * 
 * Displays the detected errors bar chart and other analytics.
 * This is the main page for analyzing test results.
 */
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Results Dashboard</h1>
        <p>Analyzing detected errors across all test results</p>
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <h2>Detected Errors</h2>
          <p className="chart-description">
            This chart shows the number of detected errors for each test result.
            Each bar represents one result from the results table.
          </p>
          <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
            {/**
             * Inline chart implementation per requirements.
             * - Fetches data from backend
             * - Renders Recharts BarChart (one bar per row)
             */}
            <ChartArea />
            <ChartArea2 />
            
          </div>
        </div>
      </div>
    </div>
  );
};

// ChartArea component kept inside this file per requirement (no separate file)
function ChartArea() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/results/detected_errors?limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Ensure array and sanitize values
        const sanitized = Array.isArray(json)
          ? json.map((r) => ({
              x: r && typeof r.x !== 'undefined' ? r.x : null,
              detected_errors:
                r && r.detected_errors != null && !Number.isNaN(Number(r.detected_errors))
                  ? Number(r.detected_errors)
                  : 0,
            }))
          : [];

        if (mounted) setData(sanitized);
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
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" label={{ value: 'Result', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'Detected Errors', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value}`} labelFormatter={(label) => `Result #${label}`} />
        <Bar dataKey="detected_errors" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ChartArea component kept inside this file per requirement (no separate file)
function ChartArea2() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/results/high_quality_errors?limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Ensure array and sanitize values
        const sanitized = Array.isArray(json)
          ? json.map((r) => ({
              x: r && typeof r.x !== 'undefined' ? r.x : null,
              high_quality_errors:
                r && r.high_quality_errors != null && !Number.isNaN(Number(r.high_quality_errors))
                  ? Number(r.high_quality_errors)
                  : 0,
            }))
          : [];

        if (mounted) setData(sanitized);
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
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" label={{ value: 'Result', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'High Quality Errors', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value}`} labelFormatter={(label) => `Result #${label}`} />
        <Bar dataKey="high_quality_errors" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Dashboard;
