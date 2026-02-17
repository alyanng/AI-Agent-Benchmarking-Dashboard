import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

export default function MetricChart({ data, yKey, yLabel }) {
  const chartData = data.map((d, index) => ({
    name: `Prompt ${index + 1}`,
    [yLabel]: d[yKey]
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yLabel} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
