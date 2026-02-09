import { useEffect, useState } from "react";
import NavBar from './NavBar';
import { useParams } from 'react-router-dom';

export default function Errors() {
  const { configurationId } = useParams();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrMsg("");

        let url = `${API_BASE_URL}/api/errors`;
        if (configurationId) {
          url += `?configuration_id=${configurationId}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setErrors(data);
      } catch (e) {
        setErrMsg(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [configurationId, API_BASE_URL]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (errMsg) return <div style={{ padding: 16, color: "red" }}>Error: {errMsg}</div>;

  return (
    <>
      <NavBar />
      <div style={{ padding: 16 }}>
        <h2>Error Records</h2>

        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Error ID</th>
              <th>Error Type</th>
              <th>Was Fixed</th>
              <th>Project ID</th>
              <th>Configuration ID</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e) => (
              <tr key={e.error_id}>
                <td>{e.error_id}</td>
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
