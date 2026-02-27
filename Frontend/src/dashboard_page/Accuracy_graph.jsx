import {ResponsiveContainer, LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {useState, useEffect} from 'react';


function Accuracy_graph({data}){


    const [configurations, setConfigurations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


    //   useEffect(() => {
    //         const fetchData = async () => {
    //             try{
    //                 const configResponse = await fetch (`${API_BASE_URL}/get_config_data?project_id=${projectId}`)
    //                 const configData = await configResponse.json()
    //                 setConfigurations(configData)
    //                 setLoading(false)

    //             } catch(err) {
    //                 console.error('Error fetching configurations:', err)
    //                 setError(err.message)
    //                 setLoading(false)
    //         }
    //         }

    //     fetchData()
    // }, [projectId])

    // setConfigurations(data)

// #region Sample data

    const uniqueData = data.reduce((acc, config) => {
   
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

     <div style={{ width: '70%', height: 400 }}>
    <h3 style={{ textAlign: 'center' }}>Accuracy: high quality errors / all detected errors</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={configdata1}
        margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="5 5" />
        {/* <XAxis dataKey="configid" interval={0} 
        
        /> */}
         <XAxis dataKey="configid" interval={0}>
                            <Label 
                                value="System Prompts" 
                                angle={0} 
                                position="insideBottomRight"
                                offset={0}
                            />
                        </XAxis> 
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="accuracy" stroke="#ec4899" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  );
}

export default Accuracy_graph

