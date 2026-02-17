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
import AddSystemPrompt from "./addSystemPromptPages/add_system_prompt.jsx";
import ProjectList from './addSystemPromptPages/projectlist.jsx'
import SystemPromptList from "./addSystemPromptPages/systempromptlist.jsx";

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
        <Route path="/projectlist" element={<ProjectList />} />
        <Route path="/systempromptlist/:projectId" element={<SystemPromptList/>} />
        <Route path="/addsystemprompt/:projectId" element={<AddSystemPrompt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
