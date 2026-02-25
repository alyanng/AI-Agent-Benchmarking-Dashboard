import { BarChart, Bar, Line, LineChart, XAxis, YAxis, Label, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Home.css'
import { useState, useEffect } from 'react';
import NavBar from "./NavBar";

export default function StabilityGraph({data}) {
    // const { projectId } = useParams();
    const [stability, setStability] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

    //  useEffect(() => {
    //             const fetchData = async () => {
    //                 try{
    //                     const response = await fetch (`${API_BASE_URL}/get_stability_data?project_id=${projectId}`)
    //                     const stabilityData = await response.json()
    //                     setStability(stabilityData)
    //                     setLoading(false)
    
    //                 } catch(err) {
    //                     console.error('Error fetching stability results:', err)
    //                     setError(err.message)
    //                     setLoading(false)
    //             }
    //             }
    
    //         fetchData()
    // }, [projectId])


    // if (loading) return <div>Loading...</div>
    // if (error) return <div>Error: {error}</div>

 if (!data) {
     
     return <div>No data available</div>;  
  }

  if (data.length === 0) {
     return <div>Loading...</div>; 
  }
    return (
        <div>
            <h3 style={{ textAlign: 'center' }}>Stability: Standard deviation of false positives</h3>
            <ResponsiveContainer width={900} height={300}>
                <LineChart data ={data} margin={{ top: 10, left: 20, right: 20, bottom: 40 }}>
                 <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="configid" >
                    <Label 
                        value="Prompts" 
                        angle={0} 
                        position="insideBottomRight"
                        offset={0}
                    />
                </XAxis> 
                <YAxis>
                     <Label 
                        value="Stability" 
                        angle={-90} 
                        position="insideLeft"
                    />
                </YAxis>
                <Line type="monotone" dataKey="std_dev" stroke="#248ed9" activeDot={{ r: 8 }} />
                {/* <Bar dataKey="std_dev" fill="#3b82f6"/> */}


                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}