import { useEffect, useState } from "react";
import NavBar from "./NavBar";


async function configurationPage(project_id) {
    const [configurations, setConfigurations] = useState([])


    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    
    useEffect(() => {
        const fetchData = async () => {
            const configResponse = await fetch (`${API_BASE_URL}/get_cofig_data?project_id=${project_id}`)
            const configData = await configResponse.json()
            setConfigurations(configData)


        }

        fetchData()
    }, [project_id])


    
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

