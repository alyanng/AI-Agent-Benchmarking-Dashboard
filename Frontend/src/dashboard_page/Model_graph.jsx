import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

function Model_graph({data }) {

  // const { projectId } = useParams()
    const [configurations, setConfigurations] = useState([])
    // const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
   
    
    // useEffect(() => {
    //         const fetchData = async () => {
    //             try{
    //                 const configResponse = await fetch (`${API_BASE_URL}/get_config_data_new?project_id=${projectId}`)
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


  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 style={{ textAlign: 'center' }}>Number of fixes for different models</h3>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis 
          dataKey="model"    
          interval={0} 
          angle={-30} 
          textAnchor="end"
          height={70}
        />
        <YAxis />
        <Tooltip labelFormatter={(label) => `Model: ${label}`} />
        <Legend />
        <Bar dataKey="fixes" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

export default Model_graph;