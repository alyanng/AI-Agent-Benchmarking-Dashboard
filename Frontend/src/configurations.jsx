import { useEffect, useState } from "react";
import NavBar from "./NavBar";


async function configurationPage(project_id) {
    const [configurations, setConfigurations] = useState([])
    const[results, setResults] = useState([])

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    
    useEffect(() => {
        const fetchData = async () => {
            const configResponse = await fetch (`${API_BASE_URL}/get_configurations?project_id=${project_id}`)
            const configData = await configResponse.json()
            setConfigurations(configData)

            const resultsResponse = await fetch (`${API_BASE_URL}/get_results?project_id=${project_id}`)
            const resultsData = await resultsResponse.json()
            setResults(resultsData)
        }

        fetchData()
    }, [project_id])

    const combineData = configurations.map(config => {
        const result = results.find(r =>r.configiration_id === config_id)
    })
    
    return (
        <div>
            <h1>Configurations</h1>
            <table>
                <thead>
                    <tr>
                        <th>Configuration ID</th>
                        <th>System prompt</th>
                        <th>Number of fixes</th>
                        <th>Duration</th>
                        <th>Check errors</th>
                    </tr>
                </thead>

                <tbody>
    

                </tbody>


            </table>



        </div>
    )

}

