import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * DetectedErrorsBarChart Component
 * 
 * Fetches detected errors from the backend and renders them as a bar chart.
 * Each row from the results table becomes one bar.
 * 
 * Props:
 *   - limit: number of records to fetch (default: 50)
 */
const DetectedErrorsBarChart = ({ limit = 50 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetectedErrors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `http://localhost:8000/api/results/detected_errors?limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching detected errors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetectedErrors();
  }, [limit]);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading chart data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x"
          label={{ value: 'Result Index', position: 'insideBottomRight', offset: -10 }}
        />
        <YAxis 
          label={{ value: 'Detected Errors', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => `Errors: ${value}`}
          labelFormatter={(label) => `Result #${label}`}
        />
        <Bar dataKey="detected_errors" fill="#3b82f6" name="Detected Errors" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DetectedErrorsBarChart;
