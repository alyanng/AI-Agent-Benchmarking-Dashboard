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
        <>
        <NavBar />
        <div>
            <h1> Combined data across configuration ID </h1>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data ={combine} margin={{ left: 60, bottom: 0 }}>
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
                        value="" 
                        angle={-90} 
                        position="insideLeft"
                        offset={-10}
                    />
                </YAxis>
          
                <Bar dataKey="fixes" fill="#8884d8"/>
                <Bar dataKey="errors" fill="#8cd884"/>
                <Bar dataKey="high-quality" fill="#d8d184"/>
                <Bar dataKey="time" fill="#d884cb"/>

                </BarChart>
            </ResponsiveContainer>
        </div>
        </>
    )
}