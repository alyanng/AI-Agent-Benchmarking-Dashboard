import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * CompareModelsBarChart Component
 *
 * Fetch compare_models data from backend and render side-by-side bars
 * comparing multiple AI agent models by:
 *  - Total Fixes (sum of number_of_fixes)
 *  - Speed (fixes per minute = total_fixes / total_duration)
 *  - Total Tokens (sum of tokens)
 *
 * Props:
 *   - projectId: required project_id for backend query
 *   - limit: number of rows to fetch (default: 50)
 */
const CompareModelsBarChart = ({ projectId, limit = 50 }) => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompareModels = async () => {
      try {
        setLoading(true);
        setError(null);

        if (projectId === undefined || projectId === null) {
          throw new Error('projectId is required');
        }

        const response = await fetch(
          `http://localhost:8000/api/results/compare_models?project_id=${projectId}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setRawData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching compare models:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompareModels();
  }, [projectId, limit]);

  
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const byModel = new Map();

    for (const row of rawData) {
      const model = row.model ?? 'Unknown';
      const fixes = Number(row.number_of_fixes ?? 0);
      const duration = Number(row.duration ?? 0); // assumed minutes
      const tokens = Number(row.tokens ?? 0);

      if (!byModel.has(model)) {
        byModel.set(model, {
          model,
          total_fixes: 0,
          total_duration: 0,
          total_tokens: 0,
        });
      }

      const agg = byModel.get(model);
      agg.total_fixes += Number.isFinite(fixes) ? fixes : 0;
      agg.total_duration += Number.isFinite(duration) ? duration : 0;
      agg.total_tokens += Number.isFinite(tokens) ? tokens : 0;
    }

    // 输出给 Recharts：speed = fixes per minute
    return Array.from(byModel.values()).map((m) => ({
      model: m.model,
      total_fixes: m.total_fixes,
      speed: m.total_duration > 0 ? +(m.total_fixes / m.total_duration).toFixed(3) : 0,
      total_tokens: m.total_tokens,
      
      total_duration: +m.total_duration.toFixed(2),
    }));
  }, [rawData]);

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
  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }

  // Tooltip 
  const formatTooltipValue = (value, name, props) => {
    if (name === 'total_fixes') return [`${value}`, 'Total Fixes'];
    if (name === 'speed') return [`${value}`, 'Speed (fixes/min)'];
    if (name === 'total_tokens') return [`${value}`, 'Total Tokens'];
    return [value, name];
  };

  const formatTooltipLabel = (label) => `Model: ${label}`;

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="model"
          interval={0}
          angle={-15}
          textAnchor="end"
          height={60}
          label={{ value: 'AI Model', position: 'insideBottomRight', offset: -10 }}
        />

        {/* Fixes & Speed */}
        <YAxis
          yAxisId="left"
          label={{ value: 'Fixes / Speed', angle: -90, position: 'insideLeft' }}
        />

        {/* tokens） */}
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'Tokens', angle: -90, position: 'insideRight' }}
        />

        <Tooltip formatter={formatTooltipValue} labelFormatter={formatTooltipLabel} />
        <Legend />

        {/* side-by-side bars: */}
        <Bar yAxisId="left" dataKey="total_fixes" name="Total Fixes" fill="#3b82f6" />
        <Bar yAxisId="left" dataKey="speed" name="Speed (fixes/min)" fill="#22c55e" />
        <Bar yAxisId="right" dataKey="total_tokens" name="Total Tokens" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CompareModelsBarChart;