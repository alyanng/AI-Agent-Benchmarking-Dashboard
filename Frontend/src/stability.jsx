import { BarChart, Bar, XAxis, YAxis, Label, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Home.css'
import { useState, useEffect } from 'react';
import NavBar from "./NavBar";

export default function StabilityGraph() {
    const [stability, setStability] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

     useEffect(() => {
                const fetchData = async () => {
                    try{
                        const response = await fetch (`${API_BASE_URL}/get_stability_data`)
                        const stabilityData = await response.json()
                        setStability(stabilityData)
                        setLoading(false)
    
                    } catch(err) {
                        console.error('Error fetching stability results:', err)
                        setError(err.message)
                        setLoading(false)
                }
                }
    
            fetchData()
    }, [])


    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>


    return (
        <>
        <NavBar />
        <div>
            <h1> Stability across configuration ID </h1>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data ={stability} margin={{ left: 60, bottom: 0 }}>
                <XAxis dataKey="configid" >
                    <Label 
                        value="Prompts" 
                        angle={0} 
                        position="insideBottom"
                        offset={0}
                    />
                </XAxis> 
                <YAxis>
                     <Label 
                        value="Stability" 
                        angle={-90} 
                        position="insideLeft"
                        offset={-10}
                    />
                </YAxis>
          
                <Bar dataKey="std_dev" fill="#8884d8"/>

               



                </BarChart>
            </ResponsiveContainer>
        </div>
        </>
    )
}