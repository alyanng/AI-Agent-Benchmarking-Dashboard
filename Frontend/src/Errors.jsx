import { useEffect, useState } from "react";

export default function Errors() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch("http://localhost:8000/api/errors");
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
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (errMsg) return <div style={{ padding: 16, color: "red" }}>Error: {errMsg}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Error Records</h2>

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Error ID</th>
            <th>Error Type</th>
            <th>Was Fixed</th>
            <th>Project ID</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((e) => (
            <tr key={e.error_id}>
              <td>{e.error_id}</td>
              <td>{e.error_type}</td>
              <td>{String(e.was_fixed)}</td>
              <td>{e.project_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
