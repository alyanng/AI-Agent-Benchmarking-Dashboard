import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
        <Bar dataKey="error" fill="#fcd34d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ChartArea