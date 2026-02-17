import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home.jsx';
import Projects from "./Projects.jsx";
import Configurations from "./configurations.jsx";
import StabilityGraph from "./stability.jsx";
import Dashboard from './pages/Dashboard.jsx';
import DetectedErrorsBarChart from './components/DetectedErrorsBarChart.jsx';
import CombinedGraph from "./combined.jsx";
import Errors from "./Errors.jsx";
import AgentPerformance from "./AgentPerformance.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/configurations/:projectId" element={<Configurations />} />
        <Route path="/errors" element={<Errors />} />
        <Route path="/errors/:configurationId" element={<Errors />} />
        <Route path="/configurations/:projectId" element={<Configurations />} />

        <Route path="/projects" element={<Projects />} /> {/* Projects list page */}
        <Route path="/stability" element={<StabilityGraph />} />
        <Route path="/combined" element={<CombinedGraph />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agent-performance/:projectId" element={<AgentPerformance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
