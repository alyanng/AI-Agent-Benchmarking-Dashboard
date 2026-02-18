import { BarChart, Bar, XAxis, YAxis, Label, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Home.css'
import { useState, useEffect } from 'react';
import NavBar from "./NavBar";

export default function CombinedGraph() {
    const [combine, setCombine] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

     useEffect(() => {
                const fetchData = async () => {
                    try{ 
                        const response = await fetch (`${API_BASE_URL}/get_combined_data`)
                        const data = await response.json()
                        setCombine(data)
                        setLoading(false)
    
                    } catch(err) {
                        console.error('Error fetching combined results:', err)
                        setError(err.message)
                        setLoading(false)
                }
                }
    
            fetchData()
    }, [])


    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>


    return (
        <div>
            <h1 style={{ textAlign: "center"}}> Combined data across system prompts</h1>
            <ResponsiveContainer width={900} height={400}>
                <BarChart data ={combine} margin={{ top: 10, left: 0, right: 20, bottom: 40 }}>
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
                        value="" 
                        angle={-90} 
                        position="insideLeft"
                        offset={-10}
                    />
                </YAxis>
                <Tooltip formatter={(value) => `${value.toFixed(2)}`} labelFormatter={(label) => `Prompt ${label}`} />
                <Bar dataKey="fixes" name = "Total fixes" fill="#3b82f6"/>
                <Bar dataKey="errors" name ="Detected errors" fill="#22c55e" />
                <Bar dataKey="high-quality" name = "High-quality errors" fill="#f59e0b"/>
                <Bar dataKey="time" name = "Duration" fill="#00C49F"/>
                <Legend/>
                </BarChart>
            </ResponsiveContainer>
        </div>

    )
}

