import { useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

function App() {
  const [page, setPage] = useState("form"); // "form" or "list"

  return (
    <div className="App">
      <h1>AI Agent Benchmarking Dashboard</h1>
      <div>
        <button onClick={() => setPage("form")}>Submit Project</button>
        <button onClick={() => setPage("list")}>All Projects</button>
      </div>

      {page === "form" ? <ProjectForm /> : <ProjectList />}
    </div>
  );
}

export default App;
