import { useState } from 'react';
import './App.css';
import Home from './Home.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Errors from "./Errors";
import Projects from "./Projects.jsx"; // Add your Projects page
import Configurations from "./configurations.jsx";
import StabilityGraph from "./stability.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/project_page" element={<ProjectPage />} /> */}
        <Route path="/errors" element={<Errors />} />
        <Route path="/errors/:configurationId" element={<Errors />} />
        <Route path="/configurations/:projectId" element={<Configurations />} />

        <Route path="/projects" element={<Projects />} /> {/* Projects list page */}
        <Route path="/stability" element={<StabilityGraph />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
