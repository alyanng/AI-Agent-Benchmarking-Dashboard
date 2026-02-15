import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { useNavigate, useParams } from "react-router-dom"
import ExpandableText from "./ExpandableText";

import './configuration.css'

import './Home.css'
import Accuracy_graph from "./Accuracy_graph";

function Configurations() {
    const { projectId } = useParams()
    const [configurations, setConfigurations] = useState([])
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
   
    
    useEffect(() => {
            const fetchData = async () => {
                try{
                    const configResponse = await fetch (`${API_BASE_URL}/get_config_data?project_id=${projectId}`)
                    const configData = await configResponse.json()
                    setConfigurations(configData)
                    setLoading(false)

                } catch(err) {
                    console.error('Error fetching configurations:', err)
                    setError(err.message)
                    setLoading(false)
            }
            }

        fetchData()
    }, [projectId])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    
    return (
        <>
        <NavBar />
        <div>
            <h1>Configurations</h1>
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th>Results ID</th>
                        <th>Configuration ID</th>
                        <th>System prompt</th>
                        <th>Number of fixes</th>
                        <th>Duration</th>
                        <th>Check errors</th>
                    </tr>
                </thead>

                <tbody>
                    {configurations.map(config => (
                    <tr key={config.results_id}>
                        <td>{config.results_id}</td>
                        <td>{config.configid}</td>
                        <td className="formatted-text">
                            <ExpandableText text={config.prompt} wordLimit={50} />
                        </td>
                        <td>{config.fixes}</td>
                        <td>{config.duration}</td>
                        <td>                               
                            <button className="error-button" onClick={() => navigate(`/errors/${config.configid}`)}>Errors</button>
                        </td>
                    </tr>
                    ))}

                </tbody>


            </table>

<Accuracy_graph configdata={configurations}/>
        </div>
        </>
    )

}
export default Configurations

