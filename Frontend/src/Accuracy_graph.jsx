

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// import { RechartsDevtools } from '@recharts/devtools';

function Accuracy_graph({configdata}){
// #region Sample data

    const uniqueData = configdata.reduce((acc, config) => {
   
        if (!acc.find(item => item.configid === config.configid)) {
            acc.push(config);
        }
        return acc;
    }, []);

const configdata1=uniqueData .map(config=>({
configid:config.configid,
accuracy:config.avg_hq_errors/config.avg_detected_errors,

}))

  return (
    

    <LineChart
      style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={configdata1}
      margin={{
        top: 30,
        right: 30,
        left: 20,
        bottom: 20,
      }}
    >
      <CartesianGrid strokeDasharray="5 5" />
      <XAxis dataKey="configid"  interval={0}/>
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="accuracy" stroke="#8884d8" activeDot={{ r: 8 }} />
   
    </LineChart>

  );
}

export default Accuracy_graph

