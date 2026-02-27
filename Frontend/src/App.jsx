import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home.jsx';
import Projects from "./Projects.jsx";
import Configurations from "./configurations.jsx";
import StabilityGraph from "./dashboard_page/stability.jsx";
import Dashboard from './dashboard_page/Dashboard.jsx';
// import DetectedErrorsBarChart from './components/DetectedErrorsBarChart.jsx';
import CombinedGraph from "./dashboard_page/combined.jsx";
import Errors from "./Errors.jsx";
import AgentPerformance from "./dashboard_page/AgentPerformance.jsx";
import AddSystemPrompt from "./add_system_prompt_pages/add_system_prompt.jsx";
import ProjectList from './add_system_prompt_pages/projectlist.jsx'
import SystemPromptList from "./add_system_prompt_pages/systempromptlist.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/configurations/:projectId" element={<Configurations />} />
        <Route path="/errors" element={<Errors />} />
        <Route path="/errors/:configurationId/:run_time" element={<Errors />} />
        <Route path="/configurations/:projectId" element={<Configurations />} />
        <Route path="/agent-performance/:projectId" element={<AgentPerformance />} />
        <Route path="/projects" element={<Projects />} /> {/* Projects list page */}
        <Route path="/stability" element={<StabilityGraph />} />
        <Route path="/combined" element={<CombinedGraph />} />
        <Route path="/dashboard/:projectId" element={<Dashboard />} />
        <Route path="/projectlist" element={<ProjectList />} />
        <Route path="/systempromptlist/:projectId" element={<SystemPromptList/>} />
        <Route path="/addsystemprompt/:projectId" element={<AddSystemPrompt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
