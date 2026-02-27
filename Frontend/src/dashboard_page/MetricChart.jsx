import React from "react";
import { LineChart, Line, XAxis, YAxis,Label,  Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

export default function MetricChart({ data, yKey, yLabel }) {
  const chartData = data.map((d, index) => ({
    name: `${index}`,
    [yLabel]: d[yKey]
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
    
  <XAxis dataKey="name" >
                    <Label 
                        value="System Prompts" 
                        angle={0} 
                        position="insideBottomRight"
                        offset={-10}
                    />
                </XAxis> 

        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yLabel} stroke="#f59e0b" />
      </LineChart>
    </ResponsiveContainer>
  );
}
