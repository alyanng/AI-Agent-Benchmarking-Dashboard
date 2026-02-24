import { useEffect, useState } from "react";
import NavBar from './NavBar';
import { useParams } from 'react-router-dom';

export default function Errors() {
  const { configurationId, run_time } = useParams();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrMsg("");
    

        let url = `${API_BASE_URL}/api/errors`;
        // if (configurationId) {
        //   url += `?configuration_id=${configurationId}`;
        // }

        if (configurationId && run_time) {
  url = url + "?configuration_id=" + configurationId + "&run_time=" + run_time;
}
        console.log("[Errors] Fetching from URL:", url);
        const res = await fetch(url);
        console.log("[Errors] Response status:", res.status, "OK:", res.ok);
        
        if (!res.ok) {
          let errorBody = "";
          try {
            errorBody = await res.text();
            console.log("[Errors] Error response body:", errorBody);
          } catch (e) {
            console.log("[Errors] Could not read error body:", e.message);
          }
          throw new Error(`HTTP ${res.status}: ${errorBody || "Server error"}`);
        }

        const data = await res.json();
        console.log("[Errors] Fetched errors successfully:", data.length, "records");
        setErrors(data);
      } catch (e) {
        console.error("[Errors] Fetch failed:", e);
        setErrMsg(e?.message ?? "Failed to load errors");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [configurationId, API_BASE_URL]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (errMsg) return (
    <div style={{ padding: 16, color: "red" }}>
      <h3>⚠️ Error Loading Records</h3>
      <p><strong>{errMsg}</strong></p>
      <p style={{ fontSize: 12, color: "#666" }}>
        API Base URL: <code>{API_BASE_URL}</code><br/>
        Check browser console (F12) for more details. Ensure backend is running on {API_BASE_URL}
      </p>
    </div>
  );

  if (errors.length === 0) return (
    <div style={{ padding: 16 }}>
      <NavBar />
      <h2>Error Records</h2>
      <p style={{ color: "#666" }}>No errors found.</p>
    </div>
  );

  return (
    <>
      <NavBar />
      <div style={{ padding: 16 }}>
        <h2>Error Records</h2>

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {/* <th>Error Name</th> */}
               <th>No</th>
              <th>Error Type</th>
              <th>Was Fixed</th>
              <th>Project ID</th>
              <th>Configuration ID</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e,index) => (
              <tr key={e.error_id}>
                {/* <td>{e.error_name}</td> */}
                <td>{index+1}</td>
                <td>{e.error_type}</td>
                <td>{String(e.was_fixed)}</td>
                <td>{e.project_id}</td>
                <td>{e.configuration_id}</td>    
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
